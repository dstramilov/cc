// Script to load test data into Supabase
// Run with: npx tsx src/lib/run-load-test-data.ts

import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const { loadTestData } = await import('./load-test-data');

    console.log('Loading test data into Supabase...\n');

    const result = await loadTestData();

    if (result.success) {
        console.log('\n✅ Success!');
        console.log(`Loaded ${result.counts?.customers} customers`);
        console.log(`Loaded ${result.counts?.users} users`);
        console.log(`Loaded ${result.counts?.projects} projects`);
        console.log(`Loaded ${result.counts?.timeLogs} time logs`);
    } else {
        console.error('\n❌ Failed to load test data');
        console.error(result.error);
        process.exit(1);
    }
}

main();
