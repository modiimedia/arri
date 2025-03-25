import typia from 'typia';

const string = typia.createAssert<string>();
const boolean = typia.createAssert<boolean>();

export default [string, boolean];
