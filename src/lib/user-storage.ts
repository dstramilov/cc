import { supabase } from './supabase';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'pm' | 'customer';
    customerId?: string;
    customer_id?: string; // DB column
    status: 'active' | 'inactive';
    createdAt: string;
    created_at?: string; // DB column
}

class UserStorage {
    async getUsers(): Promise<User[]> {
        // In a real app, this might come from a 'profiles' table or auth.users
        // For now, we'll assume a 'users' table exists in public schema
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) throw error;
        return (data || []).map(this.mapToFrontend);
    }

    async saveUser(user: Partial<User>): Promise<User> {
        const dbUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            customer_id: user.customerId || user.customer_id,
            status: user.status,
        };

        const { data, error } = await supabase
            .from('users')
            .upsert(dbUser)
            .select()
            .single();

        if (error) throw error;
        return this.mapToFrontend(data);
    }

    async deleteUser(id: string): Promise<void> {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
        const { error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    }

    async clear(): Promise<void> {
        const { error } = await supabase
            .from('users')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;
    }

    private mapToFrontend(data: any): User {
        return {
            ...data,
            customerId: data.customer_id,
            createdAt: data.created_at,
        };
    }
}

export const userStorage = new UserStorage();
