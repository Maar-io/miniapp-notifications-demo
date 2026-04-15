# StartaleApp Demo Mini App

A demo mini app for StartaleApp, built on the Farcaster Mini App protocol.

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

## Wallet

This app uses the StartaleApp wallet connector (`startaleConnector()` from `@startale/app-sdk`) on the Soneium chain. The Farcaster miniapp SDK handles the protocol layer.
