# Job Skills Scraper - Complete Setup Guide (NPM)

## Step 1: Create Project Structure

Open your terminal and run:

```bash
mkdir job-skills-scraper
cd job-skills-scraper

# Create folder structure
mkdir -p backend/src/db
mkdir scraper
```

Your structure should look like:
```
job-skills-scraper/
├── backend/
│   └── src/
│       └── db/
└── scraper/
```

## Step 2: Initialize NPM Project

```bash
npm init -y
```

This creates a `package.json` file.

## Step 3: Install Dependencies

```bash
# Production dependencies
npm install drizzle-orm hono playwright better-sqlite3 @hono/node-server

# Development dependencies
npm install -D drizzle-kit @types/better-sqlite3 @types/node ts-node typescript nodemon
```

Wait for installation to complete (this may take 2-3 minutes).

## Step 4: Install Playwright Browser

```bash
npx playwright install chromium
```

This downloads the Chrome browser for scraping.

---

## Step 5: Create Configuration Files

I'll provide each file - create them exactly as shown.

### File 1: `drizzle.config.ts` (in root folder)
### File 2: `tsconfig.json` (in root folder) **IMPORTANT!**
### File 3: `backend/src/db/schema.ts`
### File 4: `backend/src/db/index.ts`
### File 5: `scraper/skill-list.ts`
### File 6: `scraper/index.ts`
### File 7: `backend/src/index.ts`
### File 8: `seed.ts` (in root folder)
### File 9: Replace your `package.json`

---

## Step 6: Setup Database

```bash
# Push the schema:
npx drizzle-kit push

# Seed initial data
npm run seed
```

You should see "✅ Database seeding complete!"

## Step 7: Run the Scraper

```bash
npm run scrape
```

This will take 2-5 minutes. You'll see progress for each region.

## Step 8: Start the API Server

```bash
npm run server
```

Server starts at `http://localhost:3000`

## Step 9: Test the API

Open a new terminal and run:

```bash
# Test 1: Get all regions
curl http://localhost:3000/api/map-summary

# Test 2: Get skills for Metro Manila
curl http://localhost:3000/api/trends/metro-manila
```

---

## Troubleshooting

### "No regions found"
Run: `npm run seed`

### "Port already in use"
Kill process: `lsof -ti:3000 | xargs kill -9`

### Playwright errors
Run: `npx playwright install chromium`

### TypeScript errors
Make sure `tsconfig.json` exists in root folder

### "Cannot find module"
All imports in TypeScript files must use `.js` extension (this is correct!)

---

All file contents are in the following artifacts. Create each file carefully!

**Key Differences from Bun:**
- Uses `better-sqlite3` instead of `bun:sqlite`
- Uses `ts-node` with ESM mode
- Uses `@hono/node-server` for compatibility
- Requires `tsconfig.json` configuration
- All imports need `.js` extensions