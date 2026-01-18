# Skill-Gap PH

**Skill-Gap PH** is a data-driven labor market analytics platform designed to bridge the information gap between the Philippine workforce and the evolving needs of employers.

Traditional labor reports often take months to release. Skill-Gap PH provides a **monthly market snapshot** by analyzing thousands of public job advertisements across 88 regions to identify which qualifications are most valued by employers today.

## Tech Stack
* **Framework:** [Hono](https://hono.dev/) (Running on Vercel)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
* **Database:** [Turso](https://turso.tech/) (Managed libSQL)
* **Scraper:** [Playwright](https://playwright.dev/)
* **Automation:** GitHub Actions

## Getting Started

### 1. Prerequisites
* A Turso account and database.
* Node.js (v20+).

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
TURSO_DATABASE_URL=libsql://your-db-name-username.turso.io
TURSO_AUTH_TOKEN=your_auth_token
NODE_ENV=development

```

### 3. Installation

```bash
npm install

```

## Methodology & Automation

The project is designed to act as a "digital census" of the Philippine job market.

### Automated Monthly Updates

The system is fully automated via **GitHub Actions**. On the 1st of every month, the following pipeline is triggered:

1. **Schema Sync:** `npm run db:push` ensures the Turso cloud database matches the local schema.
2. **Seeding:** `npm run seed` refreshes core region and skill definitions.
3. **Market Scanning:** `npm run scrape` launches a Playwright-based scraper to read thousands of job postings and update skill demand counts.

### Deployment

* **Backend:** Hosted on **Vercel** as a Serverless Function.
* **CORS:** Restricted to `https://skill-gap-frontend.vercel.app` for security.

## API Endpoints

* `GET /api/map-summary`: Regional overview of job demand.
* `GET /api/trends/:slug`: Specific skill breakdown for a province/city.
* `GET /api/export/summary`: National skill statistics for data analysis.

## Project Structure

* `/api`: Hono API routes and Turso connection logic.
* `/api/db`: Drizzle schema definitions.
* `/scraper`: Playwright logic and skill categorization rules.
* `.github/workflows`: Monthly automation logic.

---

## ⚖️ Privacy & Ethics

This tool exclusively analyzes public-facing job advertisements to identify market trends. It does not track individuals, personal resumes, or private corporate data.
