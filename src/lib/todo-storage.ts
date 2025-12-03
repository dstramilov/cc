import { supabase } from './supabase';

export type TodoStatus = 'pending' | 'in_progress' | 'completed';

export interface Todo {
    id: string;
    customer_id: string;
    title: string;
    status: TodoStatus;
    due_date?: string;
    created_at: string;
    created_by?: string;
}

class TodoStorage {
    async getTodos(customerId: string): Promise<Todo[]> {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async addTodo(todo: Omit<Todo, 'id' | 'created_at'>): Promise<Todo> {
        const { data, error } = await supabase
            .from('todos')
            .insert(todo)
            .select()
            .single();

        if (error) throw error;

        // Log activity
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && todo.customer_id) {
                const { activityStorage } = await import('./activity-storage');
                await activityStorage.createActivity({
                    customer_id: todo.customer_id,
                    user_id: user.id,
                    activity_type: 'todo_created',
                    entity_type: 'todo',
                    entity_id: data.id,
                    description: `Created task "${todo.title}"`,
                    metadata: { title: todo.title }
                });
            }
        } catch (err) {
            console.error('Failed to log activity:', err);
        }

        return data;
    }

    async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
        const { data, error } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Log activity
        try {
            if (updates.status === 'completed') {
                const { data: { user } } = await supabase.auth.getUser();
                if (user && data.customer_id) {
                    const { activityStorage } = await import('./activity-storage');
                    await activityStorage.createActivity({
                        customer_id: data.customer_id,
                        user_id: user.id,
                        activity_type: 'todo_completed',
                        entity_type: 'todo',
                        entity_id: data.id,
                        description: `Completed task "${data.title}"`,
                        metadata: { title: data.title }
                    });
                }
            }
        } catch (err) {
            console.error('Failed to log activity:', err);
        }

        return data;
    }

    async deleteTodo(id: string): Promise<void> {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

export const todoStorage = new TodoStorage();
