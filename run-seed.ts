import { seedEOLCategories } from './src/server/db/seeds/eol-categories';

console.log('Running seeds...');
await seedEOLCategories();
console.log('Done!');
process.exit(0);
