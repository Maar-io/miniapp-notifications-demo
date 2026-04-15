# StartaleApp Demo Mini App

A demo mini app for StartaleApp, built on the Farcaster Mini App protocol. Showcases wallet integration, context data, notifications, and Ethereum interactions.

## Getting Started

This is a [NextJS](https://nextjs.org/) + TypeScript + React app.

To install dependencies:

```bash
$ pnpm install
```

To run the app:

```bash
$ pnpm dev
```

## Tech Stack

- **Next.js 15** (App Router) + TypeScript + React 19
- **Wagmi/Viem** with `@startale/app-sdk` connector (Soneium chain)
- **@farcaster/miniapp-sdk** for mini app protocol features
- **Tailwind CSS** for styling
- **TanStack Query** for data fetching
- **Upstash Redis** for notification storage

## Features

### Context Display
- **Username** – User's Farcaster username
- **Avatar** – User's profile picture
- **Star Points** – StartaleApp-specific loyalty points
- **EOA Wallets** – User's Ethereum wallet address(es)

### Mini App Actions
- **Open Link** – Demonstrates `sdk.actions.openUrl()`
- **Close Mini App** – Closes the mini app with `sdk.actions.close()`
- **Last Event** – Shows the most recent SDK event (add/remove/notification events)

### Client Integration & Notifications
- **Add to Client** – Install mini app via `sdk.actions.addMiniApp()`
- **Send Notification** – Trigger push notifications to the user
- **Notification Status** – Displays whether notifications are enabled

### Ethereum Wallet
- **Connect/Disconnect** – Manage StartaleApp wallet connection
- **Display Address & Chain ID** – Shows current wallet and chain (Soneium)
- **Sign Message** – Sign arbitrary messages with `useSignMessage()`
- **Send Transaction** – Send ETH transactions with transaction receipt tracking
- **Sign Typed Data** – Sign EIP-712 typed data with `useSignTypedData()`

## Notifications

### Current Implementation
The app uses **direct Farcaster notification tokens** for sending push notifications:
- Tokens are obtained from the SDK when a user adds the mini app
- Tokens are stored in-memory (with `globalThis` persistence during hot reload)
- Notifications are sent by posting the token to Farcaster's notification service

### Alternative: Neynar API
For production deployments, consider using the **Neynar API** instead:
- Eliminates the need for token storage entirely
- Neynar manages token lifecycle internally
- Simpler architecture and fewer hot reload issues
- Requires `NEYNAR_API_KEY` environment variable

To switch to Neynar, see the commented code in `src/lib/notification-service.ts` for implementation details.

**Note for StartaleApp:** Neynar's standard endpoint uses Farcaster ID (FID), but StartaleApp uses wallet addresses. You may need to map addresses to FIDs or check if Neynar has address-based endpoints.

## Wallet

This app uses the StartaleApp wallet connector (`startaleConnector()` from `@startale/app-sdk`) on the Soneium chain. The Farcaster miniapp SDK handles the protocol layer.
