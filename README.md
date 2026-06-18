# SmartPest App

React Native application scaffolded with Expo.

## Commands

- `npm install` - install dependencies
- `npm start` - launch Expo developer tools
- `npm run android` - run on Android device/emulator
- `npm run ios` - run on iOS simulator
- `npm run web` - run in web browser

## Edge Deployment

The Expo web app can be exported as a static site and served from an edge/CDN platform.

- Set `EXPO_PUBLIC_API_BASE_URL` to the deployed backend API, for example `https://api.example.com/api/v1`.
- Keep Firebase web config values available through `EXPO_PUBLIC_FIREBASE_*` env vars or the defaults in `src/config/firebase.ts`.
- The backend is a separate Node service and should be deployed on a Node-capable host; it is not edge-safe as-is because it uses Express, Prisma, sockets, and file uploads.

## Notes

This project was initialized as a React Native Expo app in the current folder.
