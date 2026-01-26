import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL || 'postgresql://wiki_user:wiki_password@localhost:5432/wiki_dev';

  console.log('🔄 Running migrations...');

  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: '/app/backend/src/db/migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
};

runMigrations();
