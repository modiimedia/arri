// this barrel file is used for the exported "a" namespace
export { compile } from '../compile';
export type {
    InferType as infer,
    InferSubType as inferSubType,
} from '../schemas';
export { any } from './any';
export { array } from './array';
export { boolean } from './boolean';
export { discriminator } from './discriminator';
export { enumerator, stringEnum } from './enum';
export { clone, nullable, optional } from './modifiers';
export {
    float32,
    float64,
    int8,
    int16,
    int32,
    int64,
    number,
    uint8,
    uint16,
    uint32,
    uint64,
} from './numbers';
export { extend, object, omit, partial, pick } from './object';
export { record } from './record';
export { recursive } from './recursive';
export { string } from './string';
export { timestamp } from './timestamp';
export {
    coerceUnsafe as coerce,
    errors,
    decodeUnsafe as parse,
    coerce as safeCoerce,
    decode as safeParse,
    encode as serialize,
    validate,
} from './validation';
