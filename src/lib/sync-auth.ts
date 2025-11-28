
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncAdminUser() {
    console.log('Syncing Admin User...');
    const email = 'admin@antigravity.com';
    const password = 'password123';

    // 1. Try to Sign Up
    console.log(`Attempting to sign up ${email}...`);
    let { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.log('Sign up failed (likely already exists):', authError.message);
        // Try to Sign In
        console.log('Attempting to sign in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            console.error('Sign in failed:', signInError.message);
            return;
        }
        authData = signInData;
    }

    if (!authData.user) {
        console.error('No user returned from Auth.');
        return;
    }

    const authUserId = authData.user.id;
    console.log(`Auth User ID: ${authUserId}`);

    // 2. Update public.users table
    console.log('Updating public.users table...');

    // First, find the existing admin user
    const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

    if (searchError) {
        console.error('Failed to search users:', searchError);
        return;
    }

    if (existingUsers && existingUsers.length > 0) {
        const oldId = existingUsers[0].id;
        console.log(`Found existing admin user with ID: ${oldId}`);

        if (oldId === authUserId) {
            console.log('IDs already match. No update needed.');
        } else {
            // Update the ID
            // Note: Updating Primary Key can be tricky due to FK constraints.
            // But Admin user usually has no incoming FKs in this simple schema (except maybe logs?)
            // Let's try to update.
            const { error: updateError } = await supabase
                .from('users')
                .update({ id: authUserId })
                .eq('email', email);

            if (updateError) {
                console.error('Failed to update user ID:', updateError);
                // Fallback: Delete and Re-insert if update fails
                console.log('Update failed (likely PK change). Deleting and re-inserting...');

                const userToCopy = existingUsers[0];
                await supabase.from('users').delete().eq('id', oldId);

                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        ...userToCopy,
                        id: authUserId
                    });

                if (insertError) {
                    console.error('Failed to re-insert user:', insertError);
                } else {
                    console.log('Successfully re-inserted user with new ID.');
                }
            } else {
                console.log('Successfully updated user ID.');
            }
        }
    } else {
        console.log('No admin user found in public.users. Creating one...');
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: authUserId,
                name: 'Admin User',
                email: email,
                role: 'admin',
                status: 'active',
                created_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('Failed to create admin user:', insertError);
        } else {
            console.log('Created admin user in public.users.');
        }
    }
}

syncAdminUser();
