const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we're running a standalone script
const envPath = path.resolve(__dirname, '../../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
    console.log('Verifying Supabase connection...');

    // Try to insert a test customer
    const testId = '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
        .from('customers')
        .upsert({
            id: testId,
            name: 'Verification Test Customer',
            status: 'inactive'
        })
        .select()
        .single();

    if (error) {
        console.error('Connection failed:', error.message);
        process.exit(1);
    }

    console.log('Successfully connected and wrote to database!');
    console.log('Test Customer:', data);

    // Clean up
    await supabase.from('customers').delete().eq('id', testId);
    console.log('Cleaned up test data.');
}

verifyConnection();
