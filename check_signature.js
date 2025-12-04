const { createBrowserClient } = require('@supabase/auth-helpers-nextjs');

console.log('Type:', typeof createBrowserClient);
console.log('Length (args):', createBrowserClient.length);
console.log('String representation:', createBrowserClient.toString());
