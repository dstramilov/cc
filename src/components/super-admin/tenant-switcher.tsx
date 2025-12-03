'use client';

import { useTenant } from '@/hooks/use-tenant';
import { Button } from '@/components/ui/button';
import { Building2, LogOut } from 'lucide-react';
import Link from 'next/link';

export function TenantSwitcher() {
    const { isSuperAdmin, tenantName, tenantSubdomain } = useTenant();

    if (!isSuperAdmin) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start gap-3">
                    <div className="bg-yellow-400 p-2 rounded-lg">
                        <Building2 className="h-5 w-5 text-yellow-900" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-block px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                                SUPER ADMIN
                            </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-900">
                            Viewing Tenant
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                            {tenantName} ({tenantSubdomain})
                        </p>

                        <div className="flex gap-2">
                            <Link href="/super-admin" className="flex-1">
                                <Button size="sm" variant="outline" className="w-full">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    Switch Tenant
                                </Button>
                            </Link>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    // Clear super admin mode and return to own tenant
                                    window.location.href = '/';
                                }}
                                title="Exit Super Admin Mode"
                            >
                                <LogOut className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
