import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTenantData() {
    console.log('Checking tenant data...');

    // Fetch all tenants to see what we have
    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*');

    if (error) {
        console.error('Error fetching tenants:', error);
        return;
    }

    console.log(`Found ${tenants.length} tenants:`);
    tenants.forEach(t => {
        console.log(`- ID: ${t.id}, Name: ${t.name}, Subdomain: ${t.subdomain}`);
    });
}

checkTenantData();
