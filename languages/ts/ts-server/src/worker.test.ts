import { ArriApp } from './app';
import { defineService } from './service';
import { defineWorker, isWorker } from './worker';

describe('Arri Workers & Lifecycle', () => {
    test('isWorker helper and defineWorker', () => {
        const fnWorker = defineWorker(() => {});
        expect(isWorker(fnWorker)).toBe(true);

        const objWorker = defineWorker({
            name: 'custom',
            start: () => {},
            stop: () => {},
        });
        expect(isWorker(objWorker)).toBe(true);
        expect(isWorker({})).toBe(false);
        expect(isWorker(null)).toBe(false);
        expect(isWorker(undefined)).toBe(false);
    });

    test('workers do not run during app initialization or getAppDefinition', async () => {
        let started = false;
        const app = new ArriApp();

        app.registerWorker(
            defineWorker({
                name: 'test-worker',
                start: () => {
                    started = true;
                },
            }),
        );

        expect(app.workers.length).toBe(1);
        expect(app.isRunning).toBe(false);
        expect(started).toBe(false);

        // Codegen inspects getAppDefinition - this must not trigger workers
        const def = app.getAppDefinition();
        expect(def.schemaVersion).toBeDefined();
        expect(started).toBe(false);
        expect(app.isRunning).toBe(false);
    });

    test('start() invokes onStart hooks and worker.start with AbortSignal', async () => {
        const events: string[] = [];
        const app = new ArriApp({
            onStart: () => {
                events.push('options.onStart');
            },
            onStop: () => {
                events.push('options.onStop');
            },
        });

        app.onStart(() => {
            events.push('method.onStart');
        });
        app.onStop(() => {
            events.push('method.onStop');
        });

        let workerAborted = false;
        let workerStopped = false;

        app.registerWorker({
            name: 'queue-worker',
            start(signal) {
                events.push('worker.start');
                signal.addEventListener('abort', () => {
                    workerAborted = true;
                    events.push('worker.aborted');
                });
            },
            stop() {
                workerStopped = true;
                events.push('worker.stop');
            },
        });

        expect(app.isRunning).toBe(false);
        await app.start();
        expect(app.isRunning).toBe(true);

        // Check startup order
        expect(events).toContain('options.onStart');
        expect(events).toContain('method.onStart');
        expect(events).toContain('worker.start');
        expect(workerAborted).toBe(false);
        expect(workerStopped).toBe(false);

        // Now stop the app
        await app.stop();
        expect(app.isRunning).toBe(false);
        expect(workerAborted).toBe(true);
        expect(workerStopped).toBe(true);
        expect(events).toContain('worker.aborted');
        expect(events).toContain('worker.stop');
        expect(events).toContain('options.onStop');
        expect(events).toContain('method.onStop');
    });

    test('supports function shorthand in registerWorker', async () => {
        const app = new ArriApp();
        let receivedSignal: AbortSignal | undefined;

        app.registerWorker((signal) => {
            receivedSignal = signal;
        });

        await app.start();
        expect(receivedSignal).toBeDefined();
        expect(receivedSignal?.aborted).toBe(false);

        await app.stop();
        expect(receivedSignal?.aborted).toBe(true);
    });

    test('supports registering workers via ArriService mounted in app.use()', async () => {
        const app = new ArriApp();
        const service = defineService('jobs');

        let serviceWorkerStarted = false;
        let serviceWorkerStopped = false;

        service.registerWorker({
            name: 'service-worker',
            start() {
                serviceWorkerStarted = true;
            },
            stop() {
                serviceWorkerStopped = true;
            },
        });

        app.use(service);
        expect(app.workers.length).toBe(1);

        await app.start();
        expect(serviceWorkerStarted).toBe(true);

        await app.stop();
        expect(serviceWorkerStopped).toBe(true);
    });

    test('registering worker while app is already running immediately starts it', async () => {
        const app = new ArriApp();
        await app.start();
        expect(app.isRunning).toBe(true);

        let started = false;
        app.registerWorker((signal) => {
            started = true;
            expect(signal.aborted).toBe(false);
        });

        // Worker should have been started
        expect(started).toBe(true);

        await app.stop();
    });

    test('restarting an app after stop initializes a fresh AbortSignal', async () => {
        const app = new ArriApp();
        const signals: AbortSignal[] = [];

        app.registerWorker((signal) => {
            signals.push(signal);
        });

        await app.start();
        expect(signals.length).toBe(1);
        expect(signals[0]?.aborted).toBe(false);

        await app.stop();
        expect(signals[0]?.aborted).toBe(true);

        // Restart app
        await app.start();
        expect(signals.length).toBe(2);
        expect(signals[1]?.aborted).toBe(false);

        await app.stop();
        expect(signals[1]?.aborted).toBe(true);
    });

    test('hot reload simulation: starts an app with workers and triggers start() and stop() properly', async () => {
        const lifecycleEvents: string[] = [];

        // App instance 1 (Initial server boot)
        const appV1 = new ArriApp();
        let appV1WorkerRunning = false;

        appV1.registerWorker({
            name: 'v1-worker',
            start: (signal) => {
                appV1WorkerRunning = true;
                lifecycleEvents.push('v1-start');
                signal.addEventListener('abort', () => {
                    lifecycleEvents.push('v1-abort');
                });
            },
            stop: async () => {
                // Simulate asynchronous cleanup/drain
                await new Promise((resolve) => setTimeout(resolve, 10));
                appV1WorkerRunning = false;
                lifecycleEvents.push('v1-stop');
            },
        });

        expect(appV1.isRunning).toBe(false);
        expect(appV1WorkerRunning).toBe(false);

        // Server boots
        await appV1.start();
        expect(appV1.isRunning).toBe(true);
        expect(appV1WorkerRunning).toBe(true);
        expect(lifecycleEvents).toEqual(['v1-start']);

        // Hot reload happens:
        // 1. Previous app instance is stopped
        await appV1.stop();
        expect(appV1.isRunning).toBe(false);
        expect(appV1WorkerRunning).toBe(false);
        expect(lifecycleEvents).toEqual(['v1-start', 'v1-abort', 'v1-stop']);

        // 2. New app instance (reloaded module) is created and started
        const appV2 = new ArriApp();
        let appV2WorkerRunning = false;

        appV2.registerWorker({
            name: 'v2-worker',
            start: (signal) => {
                appV2WorkerRunning = true;
                lifecycleEvents.push('v2-start');
                signal.addEventListener('abort', () => {
                    lifecycleEvents.push('v2-abort');
                });
            },
            stop: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                appV2WorkerRunning = false;
                lifecycleEvents.push('v2-stop');
            },
        });

        await appV2.start();
        expect(appV2.isRunning).toBe(true);
        expect(appV2WorkerRunning).toBe(true);
        expect(lifecycleEvents).toEqual([
            'v1-start',
            'v1-abort',
            'v1-stop',
            'v2-start',
        ]);

        // 3. Final shutdown (e.g. dev server exited)
        await appV2.stop();
        expect(appV2.isRunning).toBe(false);
        expect(appV2WorkerRunning).toBe(false);
        expect(lifecycleEvents).toEqual([
            'v1-start',
            'v1-abort',
            'v1-stop',
            'v2-start',
            'v2-abort',
            'v2-stop',
        ]);
    });
});
