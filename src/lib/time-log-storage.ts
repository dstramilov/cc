import { supabase } from './supabase';

export type TimeLogStatus = 'pending' | 'approved' | 'rejected';

export interface TimeLog {
    id: string;
    projectId: string;
    project_id?: string; // DB column
    projectName?: string; // Joined
    userId: string;
    user_id?: string; // DB column
    userName?: string; // Joined
    task: string;
    date: string;
    hours: number;
    status: TimeLogStatus;
    description?: string;
    createdAt: string;
    created_at?: string; // DB column
}

class TimeLogStorage {
    async getTimeLogs(): Promise<TimeLog[]> {
        const { data, error } = await supabase
            .from('time_logs')
            .select(`
                *,
                projects (name),
                users (name)
            `)
            .order('date', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapToFrontend);
    }

    async getTimeLogsByProject(projectId: string): Promise<TimeLog[]> {
        const { data, error } = await supabase
            .from('time_logs')
            .select(`
                *,
                projects (name),
                users (name)
            `)
            .eq('project_id', projectId)
            .order('date', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapToFrontend);
    }

    async saveTimeLog(log: Partial<TimeLog>): Promise<TimeLog> {
        const dbLog = {
            id: log.id,
            project_id: log.projectId || log.project_id,
            user_id: log.userId || log.user_id,
            task: log.task,
            date: log.date,
            hours: log.hours,
            status: log.status || 'pending',
            description: log.description,
        };

        const { data, error } = await supabase
            .from('time_logs')
            .upsert(dbLog)
            .select()
            .single();

        if (error) throw error;
        return this.mapToFrontend(data);
    }

    async deleteTimeLog(id: string): Promise<void> {
        const { error } = await supabase
            .from('time_logs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async clear(): Promise<void> {
        const { error } = await supabase
            .from('time_logs')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;
    }

    private mapToFrontend(data: any): TimeLog {
        return {
            ...data,
            projectId: data.project_id,
            userId: data.user_id,
            projectName: data.projects?.name,
            userName: data.users?.name,
            createdAt: data.created_at,
        };
    }
}

export const timeLogStorage = new TimeLogStorage();
