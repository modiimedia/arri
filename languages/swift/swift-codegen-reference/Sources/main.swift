// The Swift Programming Language
// https://docs.swift.org/swift-book
import Foundation
import ObjectMapper


var book = Mapper<Book>().map(JSONString: """
{
    "id": "1",
    "name": "Tom Sawyer",
    "createdAt": "2001-01-01T06:00:00.000Z"
}
""")

print(book?.toJSONString() ?? "")
print(book?.toQueryString() ?? "")