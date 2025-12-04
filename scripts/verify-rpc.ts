import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyRpc() {
    console.log('Verifying check_subdomain_availability RPC...');

    const testSubdomain = 'test-' + Math.random().toString(36).substring(7);

    const { data, error } = await supabase.rpc('check_subdomain_availability', {
        p_subdomain: testSubdomain
    });

    if (error) {
        console.error('RPC Failed:', error);
        process.exit(1);
    }

    console.log(`Checked subdomain '${testSubdomain}':`, data);

    if (data === true) {
        console.log('SUCCESS: RPC is working and returned true for non-existent subdomain.');
    } else {
        console.log('WARNING: RPC returned false, which might mean the subdomain exists or logic is inverted.');
    }
}

verifyRpc();
