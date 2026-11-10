import { DefinitionMap } from './app';
import { HttpRpc, NamedHttpRpc, Rpc } from './rpc';
import { type ArriWorker, defineWorker, type WorkerHandler } from './worker';

export class ArriService {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    private readonly procedures: NamedHttpRpc<any, any, any>[] = [];

    private readonly definitions: DefinitionMap = {};

    private readonly workers: ArriWorker[] = [];

    rpc(name: string, procedure: Rpc<any, any, any>) {
        (procedure as any).name = `${this.name}.${name}`;
        this.procedures.push(procedure as any);
    }

    registerWorker(worker: ArriWorker | WorkerHandler) {
        this.workers.push(defineWorker(worker));
    }

    registerDefinitions(models: DefinitionMap) {
        for (const key of Object.keys(models)) {
            this.definitions[key] = models[key]!;
        }
    }

    getProcedures() {
        return this.procedures;
    }

    getDefinitions() {
        return this.definitions;
    }

    getWorkers() {
        return this.workers;
    }
}

export function defineService(
    name: string,
    procedures?: Record<string, HttpRpc<any, any, any>>,
): ArriService {
    const service = new ArriService(name);
    for (const key of Object.keys(procedures ?? {})) {
        service.rpc(key, procedures![key]!);
    }
    return service;
}
