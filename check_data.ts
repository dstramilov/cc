import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const { supabase } = require('./src/lib/supabase');

async function checkData() {
    console.log('Checking tenants...');
    const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', 'fixedcorp');

    if (tenantError) console.error('Tenant error:', tenantError);
    else console.log('Tenants found:', tenants);

    console.log('Checking users...');
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'admin@fixedcorp.com');

    if (userError) console.error('User error:', userError);
    else console.log('Users found:', users);
}

checkData();
