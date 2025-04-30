import { a } from '@arrirpc/schema';

import { RpcRequest } from './requests';
import { encodeWsRpcRequest } from './requests_ws';

const ReqData = a.object({
    foo: a.string(),
    bar: a.boolean(),
    baz: a.float64(),
});
type ReqData = a.infer<typeof ReqData>;
const $$ReqData = a.compile(ReqData);

const ResData = a.object({
    foo: a.string(),
});
type ResData = a.infer<typeof ResData>;
const _$$ResData = a.compile(ResData);

test('Encoding Messages', () => {
    const input: RpcRequest<ReqData> = {
        reqId: '15',
        procedure: 'users.getUser',
        path: '/users/get-user',
        customHeaders: {
            'X-Custom-Header': 'foo',
            Authorization: 'Bearer 12345',
        },
        data: {
            foo: 'foo',
            bar: true,
            baz: 15.5,
        },
    };
    const result = encodeWsRpcRequest(input, $$ReqData.serializeUnsafe);
    expect(result).toBe(`procedure: users.getUser
path: /users/get-user
client-version: 
req-id: 15
X-Custom-Header: foo
Authorization: Bearer 12345

{"foo":"foo","bar":true,"baz":15.5}`);
});

test('Decoding Messages', () => {});
