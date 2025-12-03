'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CreditCard,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/hooks/use-tenant';

interface Subscription {
    id: string;
    plan_name: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    amount_cents: number;
    currency: string;
}

interface Tenant {
    name: string;
    subscription_tier: string;
    max_users: number;
    max_projects: number;
    trial_ends_at: string | null;
}

const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        features: ['5 users', '10 projects', '1GB storage', 'Email support']
    },
    starter: {
        name: 'Starter',
        price: 29,
        features: ['15 users', '50 projects', '10GB storage', 'Priority email support', 'Weekly reports']
    },
    professional: {
        name: 'Professional',
        price: 99,
        features: ['50 users', '200 projects', '50GB storage', 'Phone & email support', 'Daily reports', 'Custom branding']
    },
    enterprise: {
        name: 'Enterprise',
        price: 299,
        features: ['Unlimited users', 'Unlimited projects', '100GB storage', '24/7 support', 'Custom reports', 'SSO', 'Dedicated account manager']
    }
};

export function BillingPage() {
    const { tenantId } = useTenant();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        if (tenantId) {
            loadBillingData();
        }
    }, [tenantId]);

    const loadBillingData = async () => {
        try {
            setLoading(true);

            // Load tenant info
            const { data: tenantData } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', tenantId)
                .single();

            setTenant(tenantData);

            // Load subscription info
            const { data: subData } = await supabase
                .from('tenant_subscriptions')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            setSubscription(subData);
        } catch (error) {
            console.error('Failed to load billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planName: string) => {
        setUpgrading(true);
        try {
            // Call API to create Stripe checkout session
            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planName })
            });

            const { sessionId } = await response.json();

            // Redirect to Stripe Checkout
            // @ts-ignore
            const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
            await stripe.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error('Upgrade failed:', error);
            alert('Failed to start upgrade process. Please try again.');
        } finally {
            setUpgrading(false);
        }
    };

    const handleManageBilling = async () => {
        try {
            // Create Stripe customer portal session
            const response = await fetch('/api/subscriptions/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const { url } = await response.json();
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to open billing portal:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading billing information...</p>
            </div>
        );
    }

    const currentPlan = tenant?.subscription_tier || 'free';
    const isTrialing = tenant?.trial_ends_at && new Date(tenant.trial_ends_at) > new Date();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Billing & Subscription</h2>
                <p className="text-muted-foreground">
                    Manage your subscription and billing information
                </p>
            </div>

            {/* Current Plan Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>
                                {isTrialing
                                    ? `Trial ends ${new Date(tenant.trial_ends_at!).toLocaleDateString()}`
                                    : 'Your active subscription'
                                }
                            </CardDescription>
                        </div>
                        <Badge variant={isTrialing ? 'secondary' : 'default'} className="text-lg px-4 py-2">
                            {PLANS[currentPlan as keyof typeof PLANS].name}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Up to {tenant?.max_users} users</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Up to {tenant?.max_projects} projects</span>
                            </div>
                        </div>

                        {subscription && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        ${(subscription.amount_cents / 100).toFixed(2)}/{subscription.currency}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {subscription && (
                        <div className="mt-6 flex gap-3">
                            <Button onClick={handleManageBilling} variant="outline">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Manage Billing
                            </Button>
                            {subscription.cancel_at_period_end && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Cancels at period end
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Available Plans */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(PLANS).map(([key, plan]) => {
                        const isCurrent = key === currentPlan;
                        const isUpgrade = PLANS[key as keyof typeof PLANS].price > PLANS[currentPlan as keyof typeof PLANS].price;

                        return (
                            <Card key={key} className={isCurrent ? 'border-primary' : ''}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {plan.name}
                                        {isCurrent && (
                                            <Badge variant="secondary">Current</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        <span className="text-3xl font-bold">${plan.price}</span>
                                        <span className="text-muted-foreground">/month</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 mb-4">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {!isCurrent && (
                                        <Button
                                            className="w-full"
                                            variant={isUpgrade ? 'default' : 'outline'}
                                            onClick={() => handleUpgrade(key)}
                                            disabled={upgrading}
                                        >
                                            {upgrading ? (
                                                <>
                                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : isUpgrade ? (
                                                <>
                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                    Upgrade
                                                </>
                                            ) : (
                                                'Downgrade'
                                            )}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Usage Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Usage</CardTitle>
                    <CardDescription>Track your usage against plan limits</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <UsageBar
                            label="Users"
                            current={5}
                            max={tenant?.max_users || 5}
                        />
                        <UsageBar
                            label="Projects"
                            current={12}
                            max={tenant?.max_projects || 10}
                        />
                        <UsageBar
                            label="Storage"
                            current={0.3}
                            max={1}
                            unit="GB"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function UsageBar({
    label,
    current,
    max,
    unit = ''
}: {
    label: string;
    current: number;
    max: number;
    unit?: string;
}) {
    const percentage = Math.min((current / max) * 100, 100);
    const isNearLimit = percentage > 80;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm text-muted-foreground">
                    {current.toFixed(unit === 'GB' ? 1 : 0)}{unit} / {max}{unit}
                </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all ${isNearLimit ? 'bg-orange-500' : 'bg-blue-600'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {isNearLimit && (
                <p className="text-xs text-orange-600 mt-1">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Approaching plan limit
                </p>
            )}
        </div>
    );
}
