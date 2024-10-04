// swift-tools-version: 5.10
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "swift-codegen-reference",
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "SwiftCodegenReference",
            targets: ["SwiftCodegenReference"]
        ),
        .executable(
            name: "SwiftCodegenReferenceMain",
            targets: ["SwiftCodegenReferenceMain"]
        )
    ],
    dependencies: [
        .package(name: "ArriClient", path: "../swift-client"),
        .package(url: "https://github.com/swift-server/async-http-client.git", from: "1.23.0")
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .executableTarget(
            name: "SwiftCodegenReferenceMain",
            dependencies: [
                "ArriClient",
                .product(name: "AsyncHTTPClient", package: "async-http-client"),
                "SwiftCodegenReference"
            ]

        ),
        .target(
            name: "SwiftCodegenReference",
            dependencies: ["ArriClient"]
        ),
        .testTarget(
            name: "SwiftCodegenReferenceTests",
            dependencies: ["SwiftCodegenReference", "ArriClient"]),
    ]
)
