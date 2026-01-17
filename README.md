# Job Skills Scraper & API

A production-ready full-stack application using **Hono**, **Drizzle ORM**, and **Turso** to scrape job demand data and serve it via a Vercel-hosted API.

## 🛠️ Tech Stack
* **Framework:** Hono (Running on Node.js/Vercel)
* **ORM:** Drizzle ORM
* **Database:** Turso (libSQL)
* **Scraper:** Playwright
* **Deployment:** Vercel

## 🚀 Getting Started

### 1. Prerequisites
* A [Turso](https://turso.tech) account and database.
* Node.js (v20+ recommended).
* Vercel CLI (optional for local testing).

### 2. Environment Setup
Create a `.env` file in the root directory and add your Turso credentials:
```env
TURSO_DATABASE_URL=libsql://your-db-name-username.turso.io
TURSO_AUTH_TOKEN=your_jwt_auth_token_here
NODE_ENV=development

```

### 3. Installation

```bash
npm install

```

### 4. Database Initialization

Synchronize your schema with the Turso cloud and seed the initial data:

```bash
# Push schema to Turso
npm run db:push

# Seed regions and skills
npm run seed

```

## 🏗️ Development & Production

### Local Development

To run the Hono API server locally:

```bash
npm run dev

```

The server will start at `http://localhost:3000`.

### Running the Scraper

To populate the `skill_demand` table with live data from job boards:

```bash
npm run scrape

```

### Deployment to Vercel

1. **Environment Variables:** Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to your Vercel Project Settings.
2. **Configuration:** The project uses `vercel.json` to route all `/api/*` requests to the Hono handler.
3. **Build:** Ensure your build command is set to `npm run build`.

## 📡 API Endpoints

* `GET /`: API health check.
* `GET /api/map-summary`: Get all regions with total job demand.
* `GET /api/trends/:slug`: Get top skill trends for a specific region.
* `GET /api/export/summary`: Download national skill statistics.

---

## 📂 Project Structure

* `/api`: Hono API routes and Database connection.
* `/api/db`: Drizzle schema and migration configurations.
* `/scraper`: Playwright scraping logic and skill definitions.
* `seed.ts`: Initial database population script.