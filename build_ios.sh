#!/bin/bash
echo "🚀 Starting iOS build on EAS Cloud..."

# Login using token
eas whoami || eas login --token $EAS_TOKEN

# Trigger the build
eas build -p ios --profile production --non-interactive

echo "✅ Build started! Check progress at:"
echo "👉 https://expo.dev/accounts/YOUR_ACCOUNT/projects/YOUR_PROJECT/builds"