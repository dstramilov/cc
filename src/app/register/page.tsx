'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Building2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [formData, setFormData] = useState({
        companyName: '',
        subdomain: '',
        email: '',
        password: '',
        fullName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
    const [checkingSubdomain, setCheckingSubdomain] = useState(false);

    const checkSubdomainAvailability = async (subdomain: string) => {
        if (!subdomain || subdomain.length < 3) {
            setSubdomainAvailable(null);
            return;
        }

        setCheckingSubdomain(true);
        try {
            // Use RPC to check availability securely
            const { data, error } = await supabase.rpc('check_subdomain_availability', {
                p_subdomain: subdomain
            });

            if (error) throw error;
            setSubdomainAvailable(data);
        } catch (error) {
            console.error('Error checking subdomain:', error);
            // Fallback or assume unavailable on error to be safe
            setSubdomainAvailable(false);
        } finally {
            setCheckingSubdomain(false);
        }
    };

    const handleSubdomainChange = (value: string) => {
        // Only allow lowercase letters, numbers, and hyphens
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, subdomain: sanitized });

        // Debounce subdomain check
        if (sanitized.length >= 3) {
            const timeoutId = setTimeout(() => {
                checkSubdomainAvailability(sanitized);
            }, 500);
            return () => clearTimeout(timeoutId);
        } else {
            setSubdomainAvailable(null);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate subdomain
            if (!subdomainAvailable) {
                setError('Please choose an available subdomain');
                setLoading(false);
                return;
            }

            // Call API route for registration
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyName: formData.companyName,
                    subdomain: formData.subdomain,
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Login the user to establish session on client (sets cookies)
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (loginError) {
                console.error('Auto-login failed:', loginError);
                // Redirect to login page if auto-login fails
                window.location.href = '/login?registered=true';
                return;
            }

            // Redirect to new subdomain
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const protocol = appUrl.split('://')[0];
            const domain = appUrl.split('://')[1];
            const baseUrl = `${protocol}://${formData.subdomain}.${domain}`;

            window.location.href = `${baseUrl}/onboarding?new=true`;

        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Start Your Free Trial</CardTitle>
                    <CardDescription>
                        Create your account and get started in minutes
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                type="text"
                                required
                                placeholder="Acme Inc."
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subdomain">Choose Your Subdomain</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="subdomain"
                                    type="text"
                                    required
                                    pattern="[a-z0-9-]{3,}"
                                    placeholder="acme"
                                    value={formData.subdomain}
                                    onChange={(e) => handleSubdomainChange(e.target.value)}
                                    className={
                                        subdomainAvailable === true ? 'border-green-500' :
                                            subdomainAvailable === false ? 'border-red-500' : ''
                                    }
                                />
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    .yourcentralapp.com
                                </span>
                            </div>
                            {checkingSubdomain && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Checking availability...
                                </p>
                            )}
                            {subdomainAvailable === true && (
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Subdomain available!
                                </p>
                            )}
                            {subdomainAvailable === false && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Subdomain already taken
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Use lowercase letters, numbers, and hyphens only
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Your Name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                required
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="john@acme.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={8}
                                placeholder="At least 8 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !subdomainAvailable}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating your account...
                                </>
                            ) : (
                                'Start 14-Day Free Trial'
                            )}
                        </Button>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>Cancel anytime</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                <span>Full access to all features</span>
                            </div>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <a href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
