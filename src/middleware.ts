import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    req.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // Get session
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/'];
    const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

    if (!session && !isPublicRoute) {
        // Redirect to login if not authenticated
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (session) {
        // Extract subdomain from hostname
        const hostname = req.headers.get('host') || '';
        const parts = hostname.split('.');

        // Check if we're on a subdomain (not localhost or main domain)
        let subdomain = 'legacy'; // Default for development

        if (parts.length > 2 && !hostname.includes('localhost')) {
            subdomain = parts[0];
        }

        // Resolve tenant from subdomain
        const { data: tenant, error } = await supabase
            .from('tenants')
            .select('id, status, subscription_tier')
            .eq('subdomain', subdomain)
            .single();

        if (error || !tenant) {
            // Tenant not found - redirect to main site or error page
            if (!isPublicRoute) {
                return NextResponse.redirect(new URL('/tenant-not-found', req.url));
            }
        } else {
            // Check tenant status
            if (tenant.status === 'suspended' || tenant.status === 'cancelled') {
                return NextResponse.redirect(new URL('/suspended', req.url));
            }

            // Set tenant context in database
            try {
                await supabase.rpc('set_tenant_context', { p_tenant_id: tenant.id });
            } catch (error) {
                console.error('Failed to set tenant context:', error);
            }

            // Store tenant ID in cookie for client-side access
            res.cookies.set('tenant_id', tenant.id, {
                path: '/',
                httpOnly: false, // Allow client-side access
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            // Store tenant subdomain
            res.cookies.set('tenant_subdomain', subdomain, {
                path: '/',
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
        }
    }

    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
