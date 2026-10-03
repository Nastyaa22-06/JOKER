# JOKER — Multilingual Georgian Card Game

A full-stack Georgian and English version of JOKER, designed and built by Anastasia Ioseliani.

**Live game:** [joker.anastasiaioseliani.space](https://joker.anastasiaioseliani.space)

## Features

- Georgian and English interfaces
- Public and password-protected tables
- Google, Facebook, email and guest entry flows through Auth0
- Full, 49-card and 2×9 game modes
- Smart computer players with context-aware bidding and play
- Custom avatar builder and unlockable skins
- Persistent coin rewards and return-to-game grace period
- Responsive desktop and mobile layouts
- Sound effects for cards, bidding, reactions and timers
- Animated scoring, final standings and winner celebration
- Multiple table and card themes
- Advertising placements with direct contact links

## Technology

- React 19
- TypeScript
- Vinext / Vite
- Cloudflare Workers and D1
- Drizzle ORM
- Auth0
- DiceBear avatars
- CSS animations and Web Audio

## Run locally

Requirements: Node.js 22.13+ and pnpm 11.

```bash
pnpm install
pnpm dev
```

Create a local `.env` file when testing Auth0:

```text
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-public-client-id
AUTH0_EMAIL_CONNECTION=Username-Password-Authentication
```

Never commit an Auth0 client secret. The browser application only needs the public domain and client ID.

## Production build

```bash
pnpm build
```

The project is configured for Cloudflare-compatible deployment and uses D1 migrations from the `drizzle/` directory.

## Project structure

- `app/CardoraGameV2.tsx` — lobby, gameplay, avatars, rewards and UI state
- `app/joker-v2.css` — responsive game and avatar styling
- `app/api/` — rooms, profiles, economy and Auth0 configuration
- `db/` and `drizzle/` — persistent data schema and migrations
- `public/` — card art, sprites, card backs and branding

## Author

[Anastasia Ioseliani](https://anastasiaioseliani.space)
