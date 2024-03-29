import { arriSafeRequest, isArriError } from "./_index";

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
        expect(isArriError(request.error));
        expect(request.error.code).toBe(500);
    }
});
