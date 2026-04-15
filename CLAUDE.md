# StartaleApp Mini App Demo

## Project Overview
This is a demo miniapp for **StartaleApp**, a Farcaster client that runs miniapps in iframes. Originally forked from Farcaster's frames-v2-demo, being converted to showcase StartaleApp as the host client.

## Key Architecture Decisions

### Wallet & Authentication
- **ONLY use StartaleApp wallet** for login — `startaleConnector()` from `@startale/app-sdk`
- Do NOT use `farcasterMiniApp()` from `@farcaster/miniapp-wagmi-connector` for wallet connection
- Target chain: **Soneium** (`import { soneium } from "wagmi/chains"`)
- Reference implementation: `/Users/mario/op/mustard-farcaster-miniapp/lib/wagmi.ts`

### Protocol vs Client Branding
- `@farcaster/miniapp-sdk` and other `@farcaster/*` protocol packages **stay** — StartaleApp is a Farcaster client
- All **user-facing branding** (titles, descriptions, UI text) should reference "StartaleApp", not "Warpcast"
- Warpcast-specific URLs and links should be removed or replaced

## Tech Stack
- Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS
- Wagmi/Viem with `@startale/app-sdk` connector (Soneium chain)
- `@farcaster/miniapp-sdk` for miniapp protocol features
- Upstash Redis for notification storage
- TanStack Query for data fetching

## Farcaster Mini App Compliance Rules
- Always call `sdk.actions.ready()` immediately after init
- Use `fc:miniapp` meta tags (NOT Frames v1 syntax)
- Manifest must be at `/.well-known/farcaster.json`
- Use `"version": "1"` (not "next") for new implementations
- Never reference Frames v1 fields or outdated syntax
- Verify against official SDK schema from `@farcaster/miniapp-sdk`
- Docs reference: https://miniapps.farcaster.xyz/llms-full.txt

## Commands
- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint
