import { seedRoles } from './roles';
import { seedAdmin } from './admin';
import { seedCategories } from './categories';
import { seedTags } from './tags';
import { seedEOL } from './eol';
import { seedEOLCategories } from './eol-categories';
import { seedWikiPages } from './wiki-pages';
import { client } from '../client';

const runSeeds = async () => {
  console.log('🚀 Starting database seeding...');
  console.log('');

  try {
    await seedRoles();
    await seedAdmin();
    await seedCategories();
    await seedTags();
    await seedEOLCategories();
    await seedEOL({ clean: true }); // Clean before seeding
    await seedWikiPages();

    console.log('');
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
