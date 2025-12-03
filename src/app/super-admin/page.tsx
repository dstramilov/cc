'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/use-tenant';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Building2,
    Users,
    FolderKanban,
    Search,
    ExternalLink,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    status: string;
    subscription_tier: string;
    max_users: number;
    max_projects: number;
    created_at: string;
    trial_ends_at: string | null;
}

export default function SuperAdminDashboard() {
    const { isSuperAdmin, isLoading } = useTenant();
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isSuperAdmin) {
            router.push('/');
            return;
        }

        if (isSuperAdmin) {
            loadTenants();
        }
    }, [isSuperAdmin, isLoading, router]);

    const loadTenants = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTenants(data || []);
        } catch (error) {
            console.error('Failed to load tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccessTenant = async (tenantId: string) => {
        const { switchTenant } = useTenant();
        try {
            await switchTenant(tenantId);
        } catch (error) {
            console.error('Failed to switch tenant:', error);
            alert('Failed to access tenant. Please try again.');
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!isSuperAdmin) {
        return null;
    }

    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.status === 'active').length,
        trial: tenants.filter(t => t.status === 'trial').length,
        suspended: tenants.filter(t => t.status === 'suspended').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                        Super Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Manage all tenant instances and access tenant data
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Trial</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.trial}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tenants by name or subdomain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Tenants List */}
                <div className="grid gap-4">
                    {filteredTenants.map((tenant) => (
                        <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{tenant.name}</h3>
                                            <Badge variant={
                                                tenant.status === 'active' ? 'default' :
                                                    tenant.status === 'trial' ? 'secondary' :
                                                        'destructive'
                                            }>
                                                {tenant.status}
                                            </Badge>
                                            <Badge variant="outline">
                                                {tenant.subscription_tier}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" />
                                                <span>{tenant.subdomain}.yourcentralapp.com</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>Max {tenant.max_users} users</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FolderKanban className="h-3 w-3" />
                                                <span>Max {tenant.max_projects} projects</span>
                                            </div>
                                            {tenant.trial_ends_at && (
                                                <div className="flex items-center gap-1 text-orange-600">
                                                    <AlertCircle className="h-3 w-3" />
                                                    <span>Trial ends {new Date(tenant.trial_ends_at).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Button onClick={() => handleAccessTenant(tenant.id)}>
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Access Tenant
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredTenants.length === 0 && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-muted-foreground">No tenants found</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
