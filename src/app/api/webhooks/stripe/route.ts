import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionUpdated(subscription);
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionDeleted(subscription);
            break;
        }

        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            await handlePaymentSucceeded(invoice);
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            await handlePaymentFailed(invoice);
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const tenantId = session.metadata?.tenant_id;
    const planName = session.metadata?.plan_name;

    if (!tenantId || !planName) return;

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
    );

    // Update tenant subscription
    await supabase.from('tenant_subscriptions').upsert({
        tenant_id: tenantId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        plan_name: planName,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        amount_cents: subscription.items.data[0].price.unit_amount || 0,
        currency: subscription.items.data[0].price.currency,
    });

    // Update tenant tier and limits
    const planLimits = {
        starter: { max_users: 15, max_projects: 50, max_storage_gb: 10 },
        professional: { max_users: 50, max_projects: 200, max_storage_gb: 50 },
        enterprise: { max_users: 999, max_projects: 999, max_storage_gb: 100 },
    };

    await supabase
        .from('tenants')
        .update({
            subscription_tier: planName,
            status: 'active',
            ...planLimits[planName as keyof typeof planLimits],
        })
        .eq('id', tenantId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const { data: sub } = await supabase
        .from('tenant_subscriptions')
        .select('tenant_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

    if (!sub) return;

    await supabase
        .from('tenant_subscriptions')
        .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
        })
        .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const { data: sub } = await supabase
        .from('tenant_subscriptions')
        .select('tenant_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

    if (!sub) return;

    // Downgrade to free tier
    await supabase
        .from('tenants')
        .update({
            subscription_tier: 'free',
            max_users: 5,
            max_projects: 10,
            max_storage_gb: 1,
        })
        .eq('id', sub.tenant_id);

    await supabase
        .from('tenant_subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Log successful payment
    console.log('Payment succeeded for invoice:', invoice.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const { data: sub } = await supabase
        .from('tenant_subscriptions')
        .select('tenant_id')
        .eq('stripe_customer_id', invoice.customer as string)
        .single();

    if (!sub) return;

    // Update subscription status to past_due
    await supabase
        .from('tenant_subscriptions')
        .update({ status: 'past_due' })
        .eq('tenant_id', sub.tenant_id);

    // Optionally send notification email
    console.error('Payment failed for tenant:', sub.tenant_id);
}
