
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignUp() {
    console.log('Testing Sign Up...');
    const email = `antigravity.test.${Date.now()}@gmail.com`;
    const password = 'password123';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Sign Up Error:', error.message);
        return;
    }

    console.log('Sign Up Data:', data);

    if (data.session) {
        console.log('✅ Session received! Email confirmation is likely disabled or auto-confirmed.');
    } else if (data.user) {
        console.log('⚠️ User created but no session. Email confirmation might be required.');
    }
}

testSignUp();
