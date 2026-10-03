export type WorkerHandler = (signal: AbortSignal) => Promise<void> | void;

export type WorkerErrorHandler = (
    error: unknown,
    worker: ArriWorker,
) => void | Promise<void>;

export interface ArriWorker {
    name?: string;
    start: (signal: AbortSignal) => Promise<void> | void;
    stop?: () => Promise<void> | void;
    onError?: (error: unknown) => void | Promise<void>;
}

export function defineWorker(worker: ArriWorker | WorkerHandler): ArriWorker {
    if (typeof worker === 'function') {
        return {
            start: worker,
        };
    }
    return worker;
}

export function isWorker(input: unknown): input is ArriWorker {
    return (
        typeof input === 'object' &&
        input !== null &&
        'start' in input &&
        typeof (input as { start: unknown }).start === 'function'
    );
}
