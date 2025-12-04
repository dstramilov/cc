import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('Missing DATABASE_URL environment variable');
  process.exit(1);
}

async function applyMigration() {
  const migrationFile = path.join(process.cwd(), 'migrations', '07_get_tenant_by_subdomain.sql');

  console.log('Connecting to database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log('Applying migration:', migrationFile);

    await client.query(sql);

    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
