#!/bin/bash
set -e

echo "\n\nPublishing NPM packages..."
read -p "Enter OTP: " otp
pnpm publish -r --otp $otp

echo "\n\nPublishing Dart client..."
pnpm nx publish dart-client

# arri_derive must be published before arri since arri depends on it
echo "\n\nPublishing Rust crates..."
pnpm nx publish rust-derive
pnpm nx publish rust-core
pnpm nx publish rust-client