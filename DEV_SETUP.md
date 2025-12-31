# Rydian - Development Setup

## Quick Start

```bash
# Start with clean Metro cache (recommended)
npm run start:clean

# Or use Expo CLI directly
npx expo start -c
```

## Troubleshooting: "Edit app/index.tsx" Default Screen

If you're seeing the Expo default placeholder screen instead of the actual app, follow these steps:

### 1. Clear Metro Bundler Cache

```bash
# Stop any running dev servers first (Ctrl+C)

# Clear Metro cache and restart
npx expo start -c
```

### 2. Clear All Caches (if step 1 doesn't work)

```bash
# Stop any running dev servers

# Clear watchman cache (if using watchman)
watchman watch-del-all

# Clear Metro cache
rm -rf node_modules/.cache

# Clear Expo cache
rm -rf .expo

# Restart with clean cache
npx expo start -c
```

### 3. Full Reset (if step 2 doesn't work)

```bash
# Stop any running dev servers

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Clear all caches
rm -rf .expo
rm -rf node_modules/.cache

# Restart with clean cache
npx expo start -c
```

### 4. Verify Expo Go App

In the Expo Go app on your device:
- Go to Settings (profile icon)
- Clear cache
- Close and reopen Expo Go
- Scan the QR code again

## Project Structure

```
app/
├── index.tsx              # Root redirect to /(tabs)
├── _layout.tsx            # Root layout with auth checks
├── (onboarding)/          # Onboarding flow (welcome, API key)
│   ├── _layout.tsx
│   ├── welcome.tsx
│   └── api-key.tsx
└── (tabs)/                # Main app tabs
    ├── _layout.tsx
    ├── index.tsx          # Home tab
    ├── want-to-read.tsx
    ├── explore.tsx
    ├── search.tsx
    └── profile.tsx
```

## Routing Flow

1. User opens app → lands at `/` (app/index.tsx)
2. app/index.tsx → redirects to `/(tabs)`
3. app/_layout.tsx checks authentication:
   - Not authenticated → redirects to `/(onboarding)/welcome`
   - Authenticated but in onboarding → redirects to `/(tabs)`
   - Authenticated in tabs → stays in tabs

## Configuration Verification

Ensure these configurations are correct:

### package.json
```json
{
  "main": "expo-router/entry"
}
```

### app.json
```json
{
  "expo": {
    "plugins": ["expo-router"]
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Common Issues

### Issue: "Edit app/index.tsx" placeholder screen
**Cause**: Metro bundler is serving cached content or Expo Router isn't initializing

**Solution**:
1. Stop the dev server (Ctrl+C)
2. Run `npx expo start -c` to clear cache and restart
3. Clear Expo Go app cache on your device
4. Rescan the QR code

### Issue: "Unable to resolve module" errors
**Cause**: Node modules not installed or cache issues

**Solution**:
```bash
rm -rf node_modules
npm install
npx expo start -c
```

### Issue: App redirects to onboarding after authentication
**Cause**: AsyncStorage not persisting or navigation logic issue

**Solution**:
1. Check AsyncStorage keys are being set correctly
2. Clear app data in Expo Go (Settings → Clear data)
3. Re-authenticate with a valid Hardcover API key

## Running the App

### Development
```bash
# Start with clean cache (recommended)
npm run start:clean

# Or standard start
npm start
```

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

## API Configuration

The app uses the Hardcover GraphQL API:
- Endpoint: `https://api.hardcover.app/v1/graphql`
- Authentication: Bearer token (Hardcover API key)
- Required header: `x-hasura-role: user`

Get your API key from: https://hardcover.app/account/api
