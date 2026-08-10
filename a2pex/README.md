# A2PEX Kits — Football Kits E-Commerce

A full-stack, production-structured football kits store. **The catalog starts completely empty** —
every club, kit, price and image comes from the Admin Dashboard. Nothing on the storefront is
generated, seeded, or fake.

**Stack:** React + Vite + Tailwind (client) &middot; Node.js + Express (server, runs both as a
traditional server and as a Vercel serverless function) &middot; MySQL &middot; Cloudinary for
image uploads.

```
a2pex/
├── client/     React storefront + admin dashboard
├── server/     Express API + MySQL schema
│   ├── app.js       Express app (routes/middleware) — the reusable core
│   ├── server.js    Traditional entry point (npm run dev / VPS / Docker)
│   └── api/index.js Vercel serverless entry point
└── docker-compose.yml   optional: one-command local MySQL
```

---

## 1. Prerequisites

- Node.js 18+
- MySQL 8+ or MariaDB 10.6+ (locally installed, **or** use the included `docker-compose.yml` if you have Docker)

## 2. Database setup

**Option A — Docker (easiest):**
```bash
docker compose up -d
```
This starts MySQL on `localhost:3306` with the schema already imported (user `root`, password `rootpassword`, database `a2pex`).

**Option B — Existing local MySQL/MariaDB:**
```bash
mysql -u root -p < server/database/schema.sql
```
This creates the `a2pex` database and all tables (no sample data — the schema only).

## 3. Backend setup

```bash
cd server
cp .env.example .env
```
Edit `.env` with your MySQL credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, etc.), set a real
`JWT_SECRET`, and add your Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET` — free, no card required, see the deployment guide below for how to get
these). Then:

```bash
npm install
npm run create-admin -- <username> <email> <password>
# example:
npm run create-admin -- aymane admin@a2pex.com "S3cure-Pass!"
npm run dev
```
The API runs at `http://localhost:5000`. There's no public admin sign-up screen on purpose — this
script is the only way to create an admin account, matching the brief ("Admin login" only). The
password you pass here is bcrypt-hashed before it ever touches the database — it's never stored,
logged, or displayed in plain text anywhere.

> **Security note:** if you've already shared your intended admin password with an AI assistant,
> a teammate, or in any chat/document, treat it as compromised and pick a different one before
> going live — run `npm run create-admin` again with the new password at any time to rotate it.

## 4. Frontend setup

In a second terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
The storefront runs at `http://localhost:5173`. Vite is already configured to proxy `/api` to the
backend, so the two `.env` files rarely need to change from their defaults.

## 5. First login

Go to `http://localhost:5173/admin/login` and sign in with the account you created in step 3.
From the dashboard you can:
- **Categories** → add a league (e.g. "Botola Pro") so it shows up on the homepage and in filters.
- **Products → Add kit** → fill in club, league, season, home/away/third, brand, price, discount,
  stock, sizes, description, and upload images. It appears on the public site immediately.
- **Orders** → view incoming checkouts, update status, or delete an order.

Until you add a kit, the homepage and shop page correctly show **"No football kits available."**

## 6. Production build

```bash
cd client && npm run build   # outputs client/dist — serve with any static host / Nginx
cd server && npm start        # or run behind pm2 / a process manager
```
Set `NODE_ENV=production` and a real `CLIENT_URL` in `server/.env` for CORS, and serve
`client/dist` from your web server (or point it at the Vite preview server for a quick check:
`npm run preview`).

---

## 7. Deploying for free (no credit card, anywhere)

This stack was picked specifically so the whole thing can go live at zero cost, with no card
required at any step — confirmed as of 2026:

| Piece | Service | Why |
|---|---|---|
| MySQL database | **Aiven** | Free forever, 1GB, no card |
| Backend API | **Vercel** (2nd project, serverless) | Free, no card, same account as the frontend |
| Frontend | **Vercel** | Free, no card |
| Product images | **Cloudinary** | Free forever, 25 credits/mo, no card |

> Render and Railway are common suggestions but both can prompt for card details even on their
> free tier (regional fraud checks) — Vercel and Aiven were verified not to.

### 7.1 Database (Aiven)
1. Sign up at [aiven.io](https://aiven.io) → **Create service** → **MySQL** → plan **Free**
2. From the service **Overview**, note the Host, Port, User, Password, and Database name
3. Import the schema:
   ```bash
   mysql -h <host> -P <port> -u <user> -p<password> <database> < server/database/schema.sql
   ```

### 7.2 Image storage (Cloudinary)
1. Sign up at [cloudinary.com](https://cloudinary.com) (free plan, no card)
2. Your **Cloud name**, **API Key**, and **API Secret** are shown on the dashboard home page
3. You'll paste these into Vercel's environment variables in the next step

### 7.3 Backend (Vercel — as its own project)
1. Push this project to GitHub (one repo containing both `client/` and `server/` is fine)
2. On [vercel.com](https://vercel.com): **Add New → Project** → import the repo
3. Set **Root Directory** to `server`
4. Add these environment variables:
   ```
   NODE_ENV=production
   CLIENT_URL=http://localhost:5173        (placeholder — fixed in step 7.5)
   DB_HOST=<from Aiven>
   DB_PORT=<from Aiven>
   DB_USER=<from Aiven>
   DB_PASSWORD=<from Aiven>
   DB_NAME=<from Aiven>
   JWT_SECRET=<generate with: openssl rand -hex 32>
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=<from Cloudinary>
   CLOUDINARY_API_KEY=<from Cloudinary>
   CLOUDINARY_API_SECRET=<from Cloudinary>
   MAX_UPLOAD_SIZE_MB=5
   ```
5. **Deploy** → note the URL, e.g. `https://a2pex-api.vercel.app`
6. Test: open `https://a2pex-api.vercel.app/api/health` → should return `{"status":"ok",...}`

### 7.4 Frontend (Vercel — a separate project)
1. **Add New → Project** → same repo again, but this time set **Root Directory** to `client`
2. Add environment variable: `VITE_API_URL=https://a2pex-api.vercel.app/api`
3. **Deploy** → note the URL, e.g. `https://a2pex.vercel.app`

### 7.5 Reconnect the two
Go back to the **backend** project on Vercel → Settings → Environment Variables → update:
```
CLIENT_URL=https://a2pex.vercel.app
```
→ redeploy (Vercel prompts you, or push an empty commit).

### 7.6 Create the admin account
From your own machine, with `server/.env` pointed at the **Aiven** credentials from step 7.1:
```bash
cd server
npm install
npm run create-admin -- aymane admin@a2pexkits.com "your-password-here"
```
This writes directly to the real (Aiven) database — no server access needed.

### 7.7 Verify
- [ ] `https://a2pex.vercel.app` loads and shows "No football kits available."
- [ ] `/admin/login` works with the account from 7.6
- [ ] Adding a kit (with an image) shows it on the public site immediately
- [ ] Refreshing on a deep link like `/shop` does **not** 404 (the included `client/vercel.json`
      handles this — easy to forget on a fresh Vercel/React setup)
- [ ] A test checkout appears in the admin orders list

---

## How the data model fits the brief

| Requirement | Implementation |
|---|---|
| Products, Categories, Orders, Order Items, Admins, Images, Users(optional) | `server/database/schema.sql` — 8 tables, all foreign-keyed |
| Admin login only, no public registration | `POST /api/auth/login` + `scripts/createAdmin.js` (CLI-only) |
| Add / edit / delete kit, image upload | `server/controllers/productController.js`, `uploadController.js` + Admin UI (`AddProduct`, `EditProduct`) |
| Search by club, league, season, brand, price | `GET /api/products` query params, wired to the Shop page filters |
| Cart: add / remove / qty / subtotal / total | `client/src/context/CartContext.jsx` |
| Checkout stores order in DB | `POST /api/orders` — recomputes prices & stock server-side in a transaction (never trusts client-sent prices) |
| "No football kits available." when empty | `EmptyState` component, shown on Home, Shop, and Admin Products whenever the catalog is empty |

## REST API summary

```
GET    /api/products                 filter: search, club, league, season, brand, category,
                                              kitType, minPrice, maxPrice, featured, sort, page
GET    /api/products/:idOrSlug
GET    /api/products/:id/related
POST   /api/products                 (admin)
PUT    /api/products/:id             (admin)
DELETE /api/products/:id             (admin)

GET    /api/categories
POST   /api/categories               (admin)
PUT    /api/categories/:id           (admin)
DELETE /api/categories/:id           (admin)

POST   /api/orders                   (public checkout)
GET    /api/orders                   (admin)
GET    /api/orders/:id               (admin)
PATCH  /api/orders/:id/status        (admin)
DELETE /api/orders/:id               (admin)

POST   /api/upload                   (admin, multipart "images" field, up to 6 files)
POST   /api/auth/login
GET    /api/auth/me                  (admin)
```

## Security

- Admin passwords are bcrypt-hashed (10 rounds) — never stored, logged, or returned in plain text.
- Admin routes are protected by JWT (`Authorization: Bearer <token>`), verified against the
  database on every request.
- `helmet` sets standard HTTP security headers (removes `X-Powered-By`, sets
  `X-Content-Type-Options`, `X-Frame-Options`, HSTS, etc.).
- The login route is rate-limited (10 attempts / 15 min / IP) to slow down brute-force attempts.
- Every SQL query uses parameterized placeholders (`mysql2` prepared statements) — no string
  concatenation, so there's no SQL injection surface.
- Checkout recalculates prices and stock **server-side** from the database on every order — the
  client's cart is never trusted for pricing.
- `.env` is git-ignored on both `client/` and `server/`; only `.env.example` (no real secrets)
  ships in the repo.
- Set `NODE_ENV=production` and a real, unique `JWT_SECRET` before deploying — the example value
  in `.env.example` is a placeholder, not something to use as-is.

## Branding & assets

The logo you provided has been processed into every required format under `client/public/`:
`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`,
`android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`, plus
`logo-wordmark.png` (navbar/footer/admin sidebar), `logo-lockup.png` (admin login page), and
`og-image.png` (social share preview). All of it is wired up in `client/index.html` and the
relevant components — nothing left as a text placeholder.

## Notes

- Prices are always recalculated server-side at checkout from the current DB price/discount and
  current stock — the cart on the client is just a list of `{productId, size, quantity}`.
- Deleting a product cascades to its images and sizes automatically (`ON DELETE CASCADE`).
- Uploaded images go straight to Cloudinary (never touch local disk) and are served from
  Cloudinary's CDN — this is required for serverless hosting (no writable/persistent disk) and
  happens to also fix the "images vanish after a restart" problem some free hosts have.
- This was verified end-to-end during development (schema import, admin creation, login, image
  upload, product CRUD, checkout with stock decrement, overselling correctly rejected, cascading
  delete) against a real MySQL instance — not just read over.
