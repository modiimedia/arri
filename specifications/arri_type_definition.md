_This is a work in progress_

# Arri Type Definition

This documents defines the Arri Type Definition (ATD) specification for Arri RPC. This specification heavily borrows from [JSON Type Definition](https://jsontypedef.com/), although there are some modifications.

## Modifications To JTD

-   Add support for `int64`
-   Add support for `uint64`
-   `additionalProperties` doesn't exist on properties schema. Instead it replace by `strict`. `strict` is false by default.
