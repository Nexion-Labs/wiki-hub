import { seedRoles } from './roles';
import { seedAdmin } from './admin';
import { seedCategories } from './categories';
import { seedTags } from './tags';
import { seedEOL } from './eol';
import { seedWikiPages } from './wiki-pages';
import { client } from '../client';

const runSeeds = async () => {
  console.log('🚀 Starting database seeding...');

  try {
    await seedRoles();
    await seedAdmin();
    await seedCategories();
    await seedTags();
    await seedEOL();
    await seedWikiPages();

    console.log('✨ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
    process.exit(0);
  }
};

runSeeds();
