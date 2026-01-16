import { db } from './backend/src/db/index';
import * as schema from './backend/src/db/schema';
import { SKILLS_DICTIONARY } from './scraper/skill-list';

async function seed() {
  console.log('🧹 Clearing existing data...');

  // Delete the "child" table (demand) before the "parent" table (regions/skills)
  // await db.delete(schema.skillDemand); 
  // await db.delete(schema.regions);
  // await db.delete(schema.skills);

  console.log('🌱 Seeding fresh database...\n');

  const regionData = [
    // --- DISTRICT 1: CAPITAL DISTRICT ---
    { name: 'Manila', slug: 'manila-city-metro-manila' },

    // --- DISTRICT 2: EASTERN MANILA ---
    { name: 'Mandaluyong', slug: 'mandaluyong-city-metro-manila' },
    { name: 'Pasig', slug: 'pasig-city-metro-manila' },
    { name: 'Quezon City', slug: 'quezon-city-metro-manila' },
    { name: 'Marikina', slug: 'marikina-city-metro-manila' },
    { name: 'San Juan', slug: 'san-juan-city-metro-manila' },

    // --- DISTRICT 3: NORTHERN MANILA (CAMANAVA) ---
    { name: 'Caloocan', slug: 'caloocan-city-metro-manila' },
    { name: 'Malabon', slug: 'malabon-city-metro-manila' },
    { name: 'Navotas', slug: 'navotas-city-metro-manila' },
    { name: 'Valenzuela', slug: 'valenzuela-city-metro-manila' },

    // --- DISTRICT 4: SOUTHERN MANILA ---
    { name: 'Makati', slug: 'makati-city-metro-manila' },
    { name: 'Pasay', slug: 'pasay-city-metro-manila' },
    { name: 'Taguig', slug: 'taguig-city-metro-manila' },
    { name: 'Parañaque', slug: 'paranaque-city-metro-manila' },
    { name: 'Las Piñas', slug: 'las-pinas-city-metro-manila' },
    { name: 'Muntinlupa', slug: 'muntinlupa-city-metro-manila' },
    { name: 'Pateros', slug: 'pateros-Metro-Manila' }, // The only Municipality in NCR

    // --- NCR Districts (Specific to your GeoJSON) ---
    // { name: 'NCR, City of Manila, First District (Not a Province)', slug: 'manila' },
    // { name: 'NCR, Second District (Not a Province)', slug: 'metro-manila' },
    // { name: 'NCR, Third District (Not a Province)', slug: 'metro-manila' },
    // { name: 'NCR, Fourth District (Not a Province)', slug: 'metro-manila' },

    // --- CAR & Region I/II ---
    { name: 'Abra', slug: 'abra' },
    { name: 'Apayao', slug: 'apayao' },
    { name: 'Benguet', slug: 'benguet' },
    { name: 'Ifugao', slug: 'ifugao' },
    { name: 'Kalinga', slug: 'kalinga' },
    { name: 'Mountain Province', slug: 'mountain-province' },
    { name: 'Ilocos Norte', slug: 'ilocos-norte' },
    { name: 'Ilocos Sur', slug: 'ilocos-sur' },
    { name: 'La Union', slug: 'la-union' },
    { name: 'Pangasinan', slug: 'pangasinan' },
    { name: 'Cagayan', slug: 'cagayan' },
    { name: 'Isabela', slug: 'isabela' },
    { name: 'Nueva Vizcaya', slug: 'nueva-vizcaya' },
    { name: 'Quirino', slug: 'quirino' },

    // --- Central Luzon & Southern Tagalog ---
    { name: 'Aurora', slug: 'aurora' },
    { name: 'Bataan', slug: 'bataan' },
    { name: 'Bulacan', slug: 'bulacan' },
    { name: 'Nueva Ecija', slug: 'nueva-ecija' },
    { name: 'Pampanga', slug: 'pampanga' },
    { name: 'Tarlac', slug: 'tarlac' },
    { name: 'Zambales', slug: 'zambales' },
    { name: 'Batangas', slug: 'batangas' },
    { name: 'Cavite', slug: 'cavite' },
    { name: 'Laguna', slug: 'laguna' },
    { name: 'Quezon', slug: 'quezon' },
    { name: 'Rizal', slug: 'rizal' },
    { name: 'Marinduque', slug: 'marinduque' },
    { name: 'Occidental Mindoro', slug: 'occidental-mindoro' },
    { name: 'Oriental Mindoro', slug: 'oriental-mindoro' },
    { name: 'Palawan', slug: 'palawan' },
    { name: 'Romblon', slug: 'romblon' },

    // --- Bicol & Visayas ---
    { name: 'Albay', slug: 'albay' },
    { name: 'Camarines Norte', slug: 'camarines-norte' },
    { name: 'Camarines Sur', slug: 'camarines-sur' },
    { name: 'Catanduanes', slug: 'catanduanes' },
    { name: 'Masbate', slug: 'masbate' },
    { name: 'Sorsogon', slug: 'sorsogon' },
    { name: 'Aklan', slug: 'aklan' },
    { name: 'Antique', slug: 'antique' },
    { name: 'Capiz', slug: 'capiz' },
    { name: 'Guimaras', slug: 'guimaras' },
    { name: 'Iloilo', slug: 'iloilo' },
    { name: 'Negros Occidental', slug: 'negros-occidental' },
    { name: 'Bohol', slug: 'bohol' },
    { name: 'Cebu', slug: 'cebu' },
    { name: 'Negros Oriental', slug: 'negros-oriental' },
    { name: 'Siquijor', slug: 'siquijor' },
    { name: 'Biliran', slug: 'biliran' },
    { name: 'Eastern Samar', slug: 'eastern-samar' },
    { name: 'Leyte', slug: 'leyte' },
    { name: 'Northern Samar', slug: 'northern-samar' },
    { name: 'Samar', slug: 'samar' },
    { name: 'Southern Leyte', slug: 'southern-leyte' },

    // --- Mindanao ---
    { name: 'Zamboanga del Norte', slug: 'zamboanga-del-norte' },
    { name: 'Zamboanga del Sur', slug: 'zamboanga-del-sur' },
    { name: 'Zamboanga Sibugay', slug: 'zamboanga-sibugay' },
    { name: 'Bukidnon', slug: 'bukidnon' },
    { name: 'Camiguin', slug: 'camiguin' },
    { name: 'Lanao del Norte', slug: 'lanao-del-norte' },
    { name: 'Misamis Occidental', slug: 'misamis-occidental' },
    { name: 'Misamis Oriental', slug: 'misamis-oriental' },
    { name: 'Davao de Oro', slug: 'davao-de-oro' },
    { name: 'Davao del Norte', slug: 'davao-del-norte' },
    { name: 'Davao del Sur', slug: 'davao-del-sur' },
    { name: 'Davao Occidental', slug: 'davao-occidental' },
    { name: 'Davao Oriental', slug: 'davao-oriental' },
    { name: 'Cotabato', slug: 'north-cotabato' },
    { name: 'Sarangani', slug: 'sarangani' },
    { name: 'South Cotabato', slug: 'south-cotabato' },
    { name: 'Sultan Kudarat', slug: 'sultan-kudarat' },
    { name: 'Agusan del Norte', slug: 'agusan-del-norte' },
    { name: 'Agusan del Sur', slug: 'agusan-del-sur' },
    { name: 'Dinagat island', slug: 'dinagat-islands' },
    { name: 'Surigao del Norte', slug: 'surigao-del-norte' },
    { name: 'Surigao del Sur', slug: 'surigao-del-sur' },
    { name: 'Basilan', slug: 'basilan' },
    { name: 'Lanao del Sur', slug: 'lanao-del-sur' },
    { name: 'Maguindanao del Norte', slug: 'maguindanao' },
    { name: 'Maguindanao del Sur', slug: 'maguindanao' },
    { name: 'Sulu', slug: 'sulu' },
    { name: 'Tawi-Tawi', slug: 'tawi-tawi' }
  ];

  try {
    // Insert regions
    console.log('📍 Inserting updated regions...');
    for (const region of regionData) {
      await db.insert(schema.regions)
        .values(region)
        .onConflictDoNothing();
    }
    console.log(`   ✅ Inserted ${regionData.length} regions\n`);

    // Insert skills from dictionary (keeping existing logic)
    console.log('🎯 Inserting skills...');
    for (const skill of SKILLS_DICTIONARY) {
      await db.insert(schema.skills)
        .values({
          name: skill.name,
          category: skill.category
        })
        .onConflictDoNothing();
    }
    console.log(`   ✅ Inserted ${SKILLS_DICTIONARY.length} skills\n`);

    // Verify data
    const regionCount = await db.select().from(schema.regions);
    const skillCount = await db.select().from(schema.skills);

    console.log('📊 Database Summary:');
    console.log(`   - Regions: ${regionCount.length}`);
    console.log(`   - Skills: ${skillCount.length}`);
    console.log('\n✅ Database seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seed();