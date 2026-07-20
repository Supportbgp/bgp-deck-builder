# BGP Deck Builder — MTG

Board Game Paradise deck builder for Magic: The Gathering, built with React + Vite.

## Package manager

This project uses **pnpm**. Install it once if you don't have it:

```bash
npm install -g pnpm
# or via corepack (Node 16+):
corepack enable
corepack prepare pnpm@latest --activate
```

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173/bgp-deck-builder/

## Build for production

```bash
pnpm build
pnpm preview
```

## Deploy to GitHub Pages

1. Create a repo named `bgp-deck-builder` on GitHub
2. Update `vite.config.js` base path if your repo name differs
3. Update `homepage` in `package.json` to your GitHub username
4. Push to `main` — GitHub Actions deploys automatically

Or deploy manually:
```bash
pnpm build
# Upload the dist/ folder to your hosting
```

## Admin access

Click "⚙ Admin" in the topbar. On first run, you'll be prompted to create an admin account (email + password). Credentials are stored in localStorage.

Default admin PIN has been replaced with email/password authentication.

## Project structure

```
src/
├── context/          # React context providers (Deck, Admin, UI state)
├── hooks/            # (reserved for future custom hooks)
├── components/
│   ├── layout/       # Topbar, Resizer
│   ├── search/       # SearchPanel, ResultCard
│   ├── deck/         # DeckPanel, DeckGrid, DeckCard, ManaPips, ManaBar
│   ├── detail/       # CardDetailModal
│   ├── sharing/      # ShareModal
│   ├── admin/        # AdminAuth, AdminPanel, EventsTab, SubmissionsTab, SettingsTab
│   └── modals/       # ImportModal, ExportModal, SubmitModal, SuccessModal
├── utils/
│   ├── constants.js  # FORMATS, TYPE_ORDER, BGP colors, seed events
│   ├── deckUtils.js  # cardType, groupByType, detectArchetype, encode/decode
│   ├── manaUtils.js  # parsePips, getPipClass, getColorIdentity
│   ├── canvasUtils.js# All canvas drawing functions (share card, topping card)
│   ├── scryfall.js   # API calls with autocomplete-first search
│   ├── storage.js    # localStorage wrappers
│   └── dateUtils.js  # fmtDate, fmtTime, isUpcoming, genId
└── styles/
    └── base.css      # Global styles, CSS variables, shared components
```

## Environment

No environment variables required. Scryfall API is public and requires no key.

## Make.com webhook

Set the webhook URL in Admin → Settings → Make.com Webhook. Submissions POST to this URL as JSON. Leave blank for test mode (logs to console).
