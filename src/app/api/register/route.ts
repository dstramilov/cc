import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { companyName, subdomain, fullName, email, password } = body;

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: fullName
            }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // 2. Create Tenant
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({
                name: companyName,
                subdomain,
                admin_user_id: authData.user.id,
                status: 'trial',
                subscription_tier: 'free',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                max_users: 5,
                max_projects: 10,
                max_storage_gb: 1
            })
            .select()
            .single();

        if (tenantError) {
            // Rollback user creation if possible, or just fail
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            console.error('Tenant creation failed:', tenantError);
            return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
        }

        // 3. Create Public User Profile
        const { error: userError } = await supabaseAdmin
            .from('users')
            .insert({
                id: authData.user.id,
                tenant_id: tenant.id,
                name: fullName,
                email: email,
                role: 'admin',
                status: 'active'
            });

        if (userError) {
            console.error('User profile creation failed:', userError);
            // Non-fatal, but problematic
        }

        // 4. Create Notification Preferences
        await supabaseAdmin.from('notification_preferences').insert({
            user_id: authData.user.id,
            tenant_id: tenant.id,
            weekly_summary: true,
            project_updates: true,
            budget_alerts: true,
            milestone_reminders: true
        });

        return NextResponse.json({
            success: true,
            tenantId: tenant.id,
            subdomain: tenant.subdomain
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
