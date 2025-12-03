'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface TenantContextType {
    tenantId: string | null;
    tenantName: string | null;
    tenantSubdomain: string | null;
    isSuperAdmin: boolean;
    isLoading: boolean;
    switchTenant: (tenantId: string) => Promise<void>;
    refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [tenantName, setTenantName] = useState<string | null>(null);
    const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTenantContext();
    }, []);

    const loadTenantContext = async () => {
        try {
            setIsLoading(true);

            // Get tenant from cookie (set by middleware)
            const cookies = document.cookie.split(';');
            const tenantCookie = cookies.find(c => c.trim().startsWith('tenant_id='));
            const tid = tenantCookie?.split('=')[1];

            if (tid) {
                setTenantId(tid);

                // Load tenant details
                const { data: tenant } = await supabase
                    .from('tenants')
                    .select('name, subdomain')
                    .eq('id', tid)
                    .single();

                if (tenant) {
                    setTenantName(tenant.name);
                    setTenantSubdomain(tenant.subdomain);
                }

                // Set tenant context in database
                await supabase.rpc('set_tenant_context', { p_tenant_id: tid });
            }

            // Check if user is super admin
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: admin } = await supabase
                    .from('super_admins')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .single();

                setIsSuperAdmin(!!admin);
            }
        } catch (error) {
            console.error('Failed to load tenant context:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const switchTenant = async (newTenantId: string) => {
        if (!isSuperAdmin) {
            throw new Error('Only super admins can switch tenants');
        }

        try {
            // Log the access
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: admin } = await supabase
                    .from('super_admins')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (admin) {
                    await supabase.from('tenant_access_log').insert({
                        super_admin_id: admin.id,
                        tenant_id: newTenantId,
                        action: 'switch_tenant',
                        ip_address: window.location.hostname,
                    });
                }
            }

            // Update context
            await supabase.rpc('set_tenant_context', { p_tenant_id: newTenantId });

            // Update cookie
            document.cookie = `tenant_id=${newTenantId}; path=/`;

            setTenantId(newTenantId);

            // Reload tenant details
            const { data: tenant } = await supabase
                .from('tenants')
                .select('name, subdomain')
                .eq('id', newTenantId)
                .single();

            if (tenant) {
                setTenantName(tenant.name);
                setTenantSubdomain(tenant.subdomain);
            }

            // Reload page to refresh all data
            window.location.reload();
        } catch (error) {
            console.error('Failed to switch tenant:', error);
            throw error;
        }
    };

    const refreshTenant = async () => {
        await loadTenantContext();
    };

    return (
        <TenantContext.Provider
            value={{
                tenantId,
                tenantName,
                tenantSubdomain,
                isSuperAdmin,
                isLoading,
                switchTenant,
                refreshTenant,
            }}
        >
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
