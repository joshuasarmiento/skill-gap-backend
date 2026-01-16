import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { db } from './db/index.js';
import { regions, skillDemand, skills } from './db/schema.js';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { NCR_DISTRICT_CONFIG } from './utils/ncrData';

const app = new Hono();

// Enable CORS for all API routes
app.use('/api/*', cors());

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

const port = 3000;
console.log(`🚀 Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});