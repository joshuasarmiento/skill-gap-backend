import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { serve } from '@hono/node-server';
import { db } from './db/index';
import { regions, skillDemand, skills } from './db/schema';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { NCR_DISTRICT_CONFIG } from './utils/ncrData';
import runScraper from '../scraper/index';
import seed from '../seed'

const app = new Hono();

// Enable CORS for all API routes
app.use('/api/*', cors({
    origin: (origin) => {
      const allowedOrigins = [
        'https://skill-gap-ph.vercel.app',
        'http://localhost:3000', // or whatever your local frontend port is
        'http://localhost:5173'  // common Vite port
      ];
      return allowedOrigins.includes(origin) ? origin : null;
    },
    credentials: true,
  }));

// Home route
app.get('/', (c) => {
  return c.json({ 
    message: 'Job Skills API',
    endpoints: {
      mapSummary: '/api/map-summary',
      trends: '/api/trends/:slug',
    }
  });
});

// Get all regions with their total skill demand
app.get('/api/map-summary', async (c) => {
  try {
    const result = await db
      .select({
        id: regions.id,
        name: regions.name,
        slug: regions.slug,
        totalDemand: sql<number>`COALESCE(SUM(${skillDemand.count}), 0)`.as('total_demand'),
      })
      .from(regions)
      .leftJoin(skillDemand, eq(regions.id, skillDemand.regionId))
      .groupBy(regions.id, regions.name, regions.slug);

    return c.json(result);
  } catch (error) {
    console.error('Error fetching map summary:', error);
    return c.json({ error: 'Failed to fetch map summary' }, 500);
  }
});

app.get('/api/trends/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    
    // If the slug is a District Name (from the config keys), 
    // use that array of cities. Otherwise, wrap the single slug in an array.
    const targetSlugs = NCR_DISTRICT_CONFIG[slug] || [slug];

    const data = await db
      .select({
        skillName: skills.name,
        category: skills.category,
        count: sql`SUM(${skillDemand.count})`.mapWith(Number), // Merge city counts
        lastUpdated: sql`MAX(${skillDemand.lastUpdated})`,
      })
      .from(skillDemand)
      .innerJoin(regions, eq(skillDemand.regionId, regions.id))
      .innerJoin(skills, eq(skillDemand.skillId, skills.id))
      .where(inArray(regions.slug, targetSlugs)) 
      .groupBy(skills.name, skills.category)
      .orderBy(desc(sql`SUM(${skillDemand.count})`));

    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to fetch trends' }, 500);
  }
});

// Get top skills across all regions
app.get('/api/top-skills', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    
    const topSkills = await db
      .select({
        skillName: skills.name,
        category: skills.category,
        totalCount: sql<number>`SUM(${skillDemand.count})`.as('total_count'),
      })
      .from(skillDemand)
      .innerJoin(skills, eq(skillDemand.skillId, skills.id))
      .groupBy(skills.id, skills.name, skills.category)
      .orderBy(desc(sql`SUM(${skillDemand.count})`))
      .limit(limit);

    return c.json(topSkills);
  } catch (error) {
    console.error('Error fetching top skills:', error);
    return c.json({ error: 'Failed to fetch top skills' }, 500);
  }
});

app.get('/api/export/csv', async (c) => {
  try {
    const allData = await db
      .select({
        region: regions.name,
        skill: skills.name,
        category: skills.category,
        demandCount: skillDemand.count,
        lastUpdated: skillDemand.lastUpdated,
      })
      .from(skillDemand)
      .innerJoin(regions, eq(skillDemand.regionId, regions.id))
      .innerJoin(skills, eq(skillDemand.skillId, skills.id))
      .orderBy(desc(skillDemand.count));

    return c.json(allData);
  } catch (error) {
    console.error('Export error:', error);
    return c.json({ error: 'Failed to generate export' }, 500);
  }
});

app.get('/api/export/raw', async (c) => {
  try {
    const data = await db
      .select({
        region: regions.name,
        skill: skills.name,
        category: skills.category,
        demandCount: skillDemand.count,
        lastUpdated: skillDemand.lastUpdated,
      })
      .from(skillDemand)
      .innerJoin(regions, eq(skillDemand.regionId, regions.id))
      .innerJoin(skills, eq(skillDemand.skillId, skills.id))
      .orderBy(desc(skillDemand.count));

    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to generate export data' }, 500);
  }
});

// National Stats Export (Full Summary)
app.get('/api/export/summary', async (c) => {
  const stats = await db
    .select({
      skill: skills.name,
      totalDemand: sql`SUM(${skillDemand.count})`.mapWith(Number)
    })
    .from(skillDemand)
    .innerJoin(skills, eq(skillDemand.skillId, skills.id))
    .groupBy(skills.name);
    
  return c.json({
    generatedAt: new Date().toISOString(),
    version: "1.0",
    data: stats
  });
});

app.get('/api/scheduled-task', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  // Check if the request is authorized
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    await db.delete(skillDemand);
    await db.delete(regions);
    await db.delete(skills);

    await runScraper();

    return c.json({ 
      success: true, 
      message: 'Database cleared and scrape completed successfully',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Scrape failed:', error);
    return c.json({ error: 'Scrape failed' }, 500);
  }
});

// Production
export const GET = handle(app);
export const POST = handle(app);
// export const PUT = handle(app);
// export const DELETE = handle(app);

if (process.env.NODE_ENV !== 'production') {
  const port = 3000
  console.log(`🚀 Node Server running on http://localhost:${port}`)
  serve({ fetch: app.fetch, port })
}

// Development
// const port = 3000;
// console.log(`🚀 Server running at http://localhost:${port}`);
// Export the handler for Vercel

// serve({
//   fetch: app.fetch,
//   // port
// });

export default app


