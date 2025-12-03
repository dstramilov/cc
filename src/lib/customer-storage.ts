import { supabase } from './supabase';

export interface Customer {
    id: string;          // UUID from Supabase
    external_id?: string; // Snake_case for DB
    externalId?: string;  // CamelCase for frontend compatibility
    name: string;
    email?: string;
    domain?: string;
    status: 'active' | 'inactive';
    primary_user_id?: string;
    primaryUserId?: string;
    tenantId?: string;
    tenant_id?: string;
    created_at?: string;
    createdAt?: string;
}

class CustomerStorage {
    async getCustomers(): Promise<Customer[]> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name');

        if (error) throw error;

        // Map DB columns to frontend camelCase if needed
        return (data || []).map(this.mapToFrontend);
    }

    async saveCustomer(customer: Partial<Customer>): Promise<Customer> {
        // Map frontend camelCase to DB snake_case
        const dbCustomer = {
            id: customer.id,
            external_id: customer.externalId || customer.external_id,
            name: customer.name,
            email: customer.email,
            domain: customer.domain,
            status: customer.status,
            tenant_id: customer.tenantId || customer.tenant_id,
            // primary_user_id: customer.primaryUserId || customer.primary_user_id, // Column missing in DB
        };

        const { data, error } = await supabase
            .from('customers')
            .upsert(dbCustomer)
            .select()
            .single();

        if (error) throw error;
        return this.mapToFrontend(data);
    }

    async deleteCustomer(id: string): Promise<void> {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async updateCustomerStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
        const { error } = await supabase
            .from('customers')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    }

    async clear(): Promise<void> {
        // DANGEROUS: Only for test data loading
        const { error } = await supabase
            .from('customers')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (error) throw error;
    }

    private mapToFrontend(data: any): Customer {
        return {
            ...data,
            externalId: data.external_id,
            primaryUserId: data.primary_user_id,
            tenantId: data.tenant_id,
            createdAt: data.created_at,
        };
    }
}

export const customerStorage = new CustomerStorage();
