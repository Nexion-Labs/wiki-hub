/**
 * Clean EOL Data Script
 *
 * This script removes all EOL products and versions from the database.
 * Useful for testing or resetting EOL data.
 *
 * Usage:
 *   bun src/server/db/seeds/clean-eol.ts
 */

import { db } from '../client';
import { eolProducts, eolVersions } from '../schema';
import { client } from '../client';

const cleanEOLData = async () => {
  console.log('🧹 Cleaning EOL data...');
  console.log('');

  try {
    // Delete in correct order (versions first due to foreign key)
    console.log('  🗑️  Deleting EOL versions...');
    const deletedVersions = await db.delete(eolVersions).execute();
    console.log(`     ✓ Deleted ${deletedVersions.rowCount || 0} versions`);

    console.log('  🗑️  Deleting EOL products...');
    const deletedProducts = await db.delete(eolProducts).execute();
    console.log(`     ✓ Deleted ${deletedProducts.rowCount || 0} products`);

    console.log('');
    console.log('✅ EOL data cleaned successfully!');
  } catch (error) {
    console.error('❌ Failed to clean EOL data:', error);
    throw error;
  } finally {
    await client.end();
    process.exit(0);
  }
};

cleanEOLData();
