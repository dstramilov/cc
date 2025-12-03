import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

const PRICE_IDS = {
    starter: process.env.STRIPE_PRICE_STARTER!,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
};

export async function POST(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
    const { planName } = await req.json();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID
    const tenantId = req.cookies.get('tenant_id')?.value;
    if (!tenantId) {
        return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    // Validate plan
    if (!PRICE_IDS[planName as keyof typeof PRICE_IDS]) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    try {
        // Check if tenant already has a subscription
        const { data: existingSub } = await supabase
            .from('tenant_subscriptions')
            .select('stripe_customer_id, stripe_subscription_id')
            .eq('tenant_id', tenantId)
            .single();

        let customerId = existingSub?.stripe_customer_id;

        if (!customerId) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    tenant_id: tenantId,
                },
            });
            customerId = customer.id;
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: existingSub?.stripe_subscription_id ? 'subscription' : 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PRICE_IDS[planName as keyof typeof PRICE_IDS],
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
            client_reference_id: tenantId,
            metadata: {
                tenant_id: tenantId,
                plan_name: planName,
            },
        });

        return NextResponse.json({ sessionId: session.id });
    } catch (error: any) {
        console.error('Subscription creation error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
