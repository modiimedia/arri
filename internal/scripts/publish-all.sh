#!/bin/bash
set -e

echo "\n\nPublishing NPM packages..."
read -p "Enter OTP: " otp
pnpm publish -r --otp $otp

echo "\n\nPublishing Dart client..."
pnpm nx publish dart-client

echo "\n\nPublishing Rust client..."
pnpm nx publish rust-client