# ecom-react-web

Next.js storefront and admin dashboard for the eCommerce platform. Connects to [ecom-node-api](https://github.com/jasoumik/ecom-node-api) for all data.

## Tech Stack

- **Framework** — Next.js v16 (App Router)
- **UI** — React 19, Tailwind CSS v4
- **State** — Zustand + TanStack React Query
- **Animations** — Framer Motion
- **Rich Text** — Tiptap

## Prerequisites

- Node.js 20+
- npm
- [ecom-node-api](https://github.com/jasoumik/ecom-node-api) running locally or deployed

## Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env.local
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Full URL to the API including /api (e.g. `http://localhost:3000/api`) |
| `PORT` | Frontend port (default: 3001) |

## Running

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

App will be available at `http://localhost:3001`

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Public storefront pages
│   ├── admin/              # Admin dashboard pages
│   ├── products/           # Product listing & detail
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout flow (buy/[id])
│   ├── profile/            # User profile & orders
│   ├── login/              # Auth pages
│   └── ...
├── components/
│   ├── layout/             # Header, Footer, BottomNav
│   └── ui/                 # Reusable UI components
└── lib/
    ├── config.ts           # API URL config
    ├── cart.ts             # Cart store (Zustand)
    ├── wishlist.ts         # Wishlist store
    ├── utils.ts            # Helpers including getImageUrl()
    └── ...
```

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/products` | Product catalog |
| `/products/[id]` | Product detail |
| `/cart` | Shopping cart |
| `/buy/[id]` | Direct checkout |
| `/login` | Login / OTP auth |
| `/profile` | User account |
| `/profile/orders` | Order history |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Order management |
| `/admin/media` | Media file manager |

## Related Repos

- **Backend (API)** — [ecom-node-api](https://github.com/jasoumik/ecom-node-api)
