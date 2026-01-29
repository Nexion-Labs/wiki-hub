import { runSeeds } from './src/server/db/seeds';

console.log('Running seeds...');
await runSeeds();
console.log('Done!');
process.exit(0);
