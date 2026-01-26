import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://wiki_user:wiki_password@localhost:5432/wiki_dev';

// Create the connection
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create the drizzle instance
export const db = drizzle(client, { schema });

export { client };
