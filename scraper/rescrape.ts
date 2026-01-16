import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { db } from '../backend/src/db/index';
import * as schema from '../backend/src/db/schema';
import { SKILLS_DICTIONARY } from './skill-list';
import { sql, eq, isNull } from 'drizzle-orm';

chromium.use(StealthPlugin());

async function runScraper() {
  console.log('🚀 Launching Advanced Stealth Scraper...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  // 1. FETCH ONLY UNSCRAPED REGIONS
  // We use a Left Join and filter for NULL to skip regions that already have data.
  console.log('🔍 Checking for regions that need processing...');
  const regionsToScrape = await db
    .select({
      id: schema.regions.id,
      name: schema.regions.name,
      slug: schema.regions.slug,
    })
    .from(schema.regions)
    .leftJoin(schema.skillDemand, eq(schema.regions.id, schema.skillDemand.regionId))
    .where(isNull(schema.skillDemand.regionId))
    .groupBy(schema.regions.id);

  if (regionsToScrape.length === 0) {
    console.log('✅ All regions are already up to date. Exiting.');
    await browser.close();
    process.exit(0);
  }

  console.log(`📋 Found ${regionsToScrape.length} regions remaining.`);

  // Cache skills in memory for faster lookup
  const dbSkills = await db.select().from(schema.skills);

  for (const region of regionsToScrape) {
    console.log(`\n📍 [Scraping] ${region.name} (${region.slug})`);
    
    for (let p = 1; p <= 15; p++) {
      const url = `https://ph.jobstreet.com/jobs/in-${region.slug}?page=${p}`;
      console.log(`  📄 Page ${p}...`);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.mouse.wheel(0, 1000); 
        await page.waitForTimeout(2000);

        const jobCards = await page.$$eval('[data-testid="job-card"]', (cards) => 
          cards.map(c => (c as HTMLElement).innerText.toLowerCase())
        );

        if (jobCards.length === 0) {
          console.log(`  ⏹️ No more jobs found in ${region.name} at page ${p}.`);
          break; 
        }

        const pageCounts: Record<string, number> = {};
        
        // Count skills found on this specific page
        jobCards.forEach(desc => {
          SKILLS_DICTIONARY.forEach(skill => {
            const regex = new RegExp(`\\b${skill.name.toLowerCase()}\\b`, 'i');
            if (regex.test(desc)) {
              pageCounts[skill.name] = (pageCounts[skill.name] || 0) + 1;
            }
          });
        });

        // Batch update database for the current page
        const updates = Object.entries(pageCounts).map(([skillName, count]) => {
          const skillRecord = dbSkills.find(s => s.name === skillName);
          if (!skillRecord) return null;

          return db.insert(schema.skillDemand).values({
            regionId: region.id,
            skillId: skillRecord.id,
            count: count
          }).onConflictDoUpdate({
            target: [schema.skillDemand.regionId, schema.skillDemand.skillId],
            set: { 
              count: sql`${schema.skillDemand.count} + ${count}`,
              lastUpdated: sql`CURRENT_TIMESTAMP`
            }
          });
        }).filter(Boolean);

        if (updates.length > 0) {
          await Promise.all(updates);
          console.log(`  ✅ Synced ${updates.length} skills to DB`);
        }

      } catch (err: any) {
        console.error(`  ⚠️ Error on ${region.name} page ${p}:`, err.message);
      }
      
      // Variable delay to bypass bot detection
      await page.waitForTimeout(Math.random() * 2000 + 1000); 
    }
  }

  console.log('\n🏁 All pending regions processed successfully.');
  await browser.close();
  process.exit(0);
}

runScraper();