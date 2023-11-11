import { arriSafeRequest, isArriRequestError } from "./index";

test("error messages", async () => {
    const request = await arriSafeRequest({
        url: "http://thisurldoesntexist.blah",
        method: "get",
        parser(input) {},
        serializer(_) {
            return undefined;
        },
    });
    expect(!request.success);
    if (!request.success) {
        expect(isArriRequestError(request.error));
        expect(request.error.statusCode).toBe(500);
    }
});
