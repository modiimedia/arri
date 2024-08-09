// swift-tools-version: 5.10
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "swift-codegen-reference",
    platforms: [
        .macOS("12.0")
    ],
    products: [
        // Products define the executables and libraries a package produces, making them visible to other packages.
        .library(
            name: "SwiftCodegenReference",
            targets: ["SwiftCodegenReference"]),
    ],
    dependencies: [
        .package(url: "https://github.com/tristanhimmelman/ObjectMapper.git", .upToNextMajor(from: "4.1.0")),
    ],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .target(
            name: "SwiftCodegenReference",
            dependencies: [
                "ObjectMapper"
            ]
        ),
        .testTarget(
            name: "BookTests",
            dependencies: ["SwiftCodegenReference"]),
    ]
)
