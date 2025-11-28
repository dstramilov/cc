const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const hasServiceKey = !!envConfig.SUPABASE_SERVICE_ROLE_KEY;
const hasAnonKey = !!envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Has Anon Key:', hasAnonKey);
console.log('Has Service Role Key:', hasServiceKey);
