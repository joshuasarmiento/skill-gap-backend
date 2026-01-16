import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { db } from '../backend/src/db/index';
import * as schema from '../backend/src/db/schema';
import { SKILLS_DICTIONARY } from './skill-list';
import { sql, eq, and } from 'drizzle-orm';

chromium.use(StealthPlugin());

async function runScraper() {
  console.log('🚀 Launching Advanced Stealth Scraper...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  const allRegions = await db.select().from(schema.regions);

  for (const region of allRegions) {
    console.log(`\n📍 Processing Region: ${region.name}`);
    
    // We scrape up to 5 pages per region to increase sample size
    for (let p = 1; p <= 15; p++) {
      const url = `https://ph.jobstreet.com/jobs/in-${region.slug}?page=${p}`;
      console.log(`  🔍 Scraping Page ${p}...`);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.mouse.wheel(0, 1000); // Trigger lazy loading
        await page.waitForTimeout(2000);

        const jobCards = await page.$$eval('[data-testid="job-card"]', (cards) => 
          cards.map(c => (c as HTMLElement).innerText.toLowerCase())
        );

        if (jobCards.length === 0) break; // No more jobs on this page

        const counts: Record<string, number> = {};
        jobCards.forEach(desc => {
          SKILLS_DICTIONARY.forEach(skill => {
            const regex = new RegExp(`\\b${skill.name.toLowerCase()}\\b`, 'i');
            if (regex.test(desc)) {
              counts[skill.name] = (counts[skill.name] || 0) + 1;
            }
          });
        });

        // Batch Update Database
        for (const [skillName, count] of Object.entries(counts)) {
          const [skillRecord] = await db.select().from(schema.skills)
            .where(eq(schema.skills.name, skillName)).limit(1);

          if (skillRecord) {
            await db.insert(schema.skillDemand).values({
              regionId: region.id,
              skillId: skillRecord.id,
              count: count
            }).onConflictDoUpdate({
              target: [schema.skillDemand.regionId, schema.skillDemand.skillId],
              set: { 
                // Increment existing count instead of overwriting
                count: sql`${schema.skillDemand.count} + ${count}`,
                lastUpdated: sql`CURRENT_TIMESTAMP`
              }
            });
          }
        }
      } catch (err) {
        console.error(`  ⚠️ Failed page ${p}:`, err);
      }
      await page.waitForTimeout(Math.random() * 3000 + 2000); // Random delay
    }
  }
  await browser.close();
  process.exit(0);
}

runScraper();