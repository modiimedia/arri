import {
    RecursiveObjectFromJsonString,
    RecursiveObjectValidate,
} from '../src/referenceClient';

export async function main() {
    const obj = RecursiveObjectFromJsonString('{}');
    const _ = RecursiveObjectValidate(obj);
}
