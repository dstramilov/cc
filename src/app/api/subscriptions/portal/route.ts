import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID from cookie or context
    const tenantId = req.cookies.get('tenant_id')?.value;
    if (!tenantId) {
        return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    try {
        // Get or create Stripe customer
        const { data: subscription } = await supabase
            .from('tenant_subscriptions')
            .select('stripe_customer_id')
            .eq('tenant_id', tenantId)
            .single();

        let customerId = subscription?.stripe_customer_id;

        if (!customerId) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    tenant_id: tenantId,
                },
            });
            customerId = customer.id;

            // Save customer ID
            await supabase
                .from('tenant_subscriptions')
                .upsert({
                    tenant_id: tenantId,
                    stripe_customer_id: customerId,
                    plan_name: 'free',
                    status: 'active',
                });
        }

        // Create billing portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Billing portal error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
