import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const regions = sqliteTable('regions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

export const skills = sqliteTable('skills', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  category: text('category').notNull(),
});

export const skillDemand = sqliteTable('skill_demand', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  regionId: integer('region_id', { mode: 'number' }).notNull().references(() => regions.id),
  skillId: integer('skill_id', { mode: 'number' }).notNull().references(() => skills.id),
  count: integer('count', { mode: 'number' }).notNull().default(0),
  lastUpdated: text('last_updated').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  uniqueRegionSkill: uniqueIndex('unique_region_skill').on(table.regionId, table.skillId),
}));