import { supabase } from './supabase';

export type ActivityType =
    | 'project_created'
    | 'project_updated'
    | 'time_logged'
    | 'todo_created'
    | 'todo_completed'
    | 'document_uploaded';

export interface Activity {
    id: string;
    customer_id: string;
    user_id: string;
    activity_type: ActivityType;
    entity_type: string;
    entity_id: string;
    description: string;
    metadata?: any;
    created_at: string;
}

class ActivityStorage {
    async getActivities(customerId: string, limit: number = 10): Promise<Activity[]> {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
        return data || [];
    }

    async createActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<void> {
        const { error } = await supabase
            .from('activities')
            .insert(activity);

        if (error) {
            console.error('Error creating activity:', error);
            // We don't throw here to prevent blocking the main action
        }
    }
}

export const activityStorage = new ActivityStorage();
