/**
 * Single consumer async iterable fed by push().
 *
 * TODO: bound the queue and expose backpressure to the transport.
 */
export class InputStream<T> implements AsyncIterable<T> {
    private readonly items: T[] = [];
    private waitingConsumer?: {
        resolve: (result: IteratorResult<T>) => void;
        reject: (error: unknown) => void;
    };
    private isEnded = false;
    private failure?: { error: unknown };

    push(item: T): void {
        if (this.isEnded) return;
        const consumer = this.takeWaitingConsumer();
        if (consumer) {
            consumer.resolve({ value: item, done: false });
            return;
        }
        this.items.push(item);
    }

    end(): void {
        if (this.isEnded) return;
        this.isEnded = true;
        this.takeWaitingConsumer()?.resolve({ value: undefined, done: true });
    }

    fail(error: unknown): void {
        if (this.isEnded) return;
        this.isEnded = true;
        this.failure = { error };
        this.items.length = 0;
        this.takeWaitingConsumer()?.reject(error);
    }

    private takeWaitingConsumer() {
        const consumer = this.waitingConsumer;
        this.waitingConsumer = undefined;
        return consumer;
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return {
            next: () => {
                if (this.items.length > 0) {
                    return Promise.resolve({
                        value: this.items.shift()!,
                        done: false,
                    });
                }
                if (this.failure) return Promise.reject(this.failure.error);
                if (this.isEnded) {
                    return Promise.resolve({ value: undefined, done: true });
                }
                return new Promise((resolve, reject) => {
                    this.waitingConsumer = { resolve, reject };
                });
            },
            return: () => {
                this.end();
                this.items.length = 0;
                return Promise.resolve({ value: undefined, done: true });
            },
        };
    }
}
