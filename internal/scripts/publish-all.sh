#!/bin/bash

echo "\n\nPublishing NPM packages..."
read -p "Enter OTP: " otp
pnpm publish -r --otp $otp

echo "\n\nPublishing Dart client..."
pnpm nx publish dart-client
