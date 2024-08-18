// swift-tools-version: 5.10
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "ArriClient",
    // platforms: [
    //     .iOS("13.0"),
    //     .macCatalyst("13.0"),
    //     .macOS("10.15"),
    //     .tvOS("13.0"),
    //     .visionOS("1.0"),
    //     .watchOS("6.0")
    // ],
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "ArriClient",
            targets: ["ArriClient"]),
    ],
    dependencies: [
        .package(url: "https://github.com/swift-server/async-http-client.git", from: "1.9.0")
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "ArriClient",
            dependencies: [
                .product(name: "AsyncHTTPClient", package: "async-http-client")
            ]
        ),
        .testTarget(
            name: "ArriClientTests",
            dependencies: ["ArriClient"]),
    ]
)
