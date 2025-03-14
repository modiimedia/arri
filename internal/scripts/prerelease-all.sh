#!/bin/bash
set -e

read -p "Enter prerelease tag name: " tag
read -p "Enter OTP: " otp
pnpm publish -r --otp $otp --tag $tag

echo "\n\nPublishing Dart client..."
pnpm nx publish dart-client

echo "\n\nCargo doesn't support prereleases at this time so skipping rust packages..."