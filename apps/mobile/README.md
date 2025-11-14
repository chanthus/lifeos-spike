# @project/mobile

React Native mobile app built with Expo and Expo Router.

## Features

- 📱 iOS and Android support
- 🚀 Expo Router for navigation
- 📡 tRPC client for API calls
- 🎨 Shared UI components

## Development

```bash
# Start development server
pnpm dev

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Run on web
pnpm web
```

## Building

Use EAS Build for production builds:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Environment Variables

Create `.env` file:

```bash
EXPO_PUBLIC_API_URL=http://localhost:43895/trpc
```

## Project Structure

```
app/
├── _layout.tsx    # Root layout with providers
└── index.tsx      # Home screen

lib/
└── trpc.ts        # tRPC client setup
```
