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
    weekEnding?: string;
    week_ending?: string; // DB column
    hours: number;
    status: TimeLogStatus;
    description?: string;
    createdAt: string;
    created_at?: string; // DB column
}

interface TimeLogDB {
    id: string;
    project_id: string;
    user_id: string;
    task: string;
    date: string;
    week_ending?: string;
    hours: number;
    status: TimeLogStatus;
    description?: string;
    created_at?: string;
    projects?: { name: string };
    users?: { name: string };
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
        return (data || []).map((l) => this.mapToFrontend(l as TimeLogDB));
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
        return (data || []).map((l) => this.mapToFrontend(l as TimeLogDB));
    }

    async saveTimeLog(log: Partial<TimeLog>): Promise<TimeLog> {
        const dbLog = {
            id: log.id,
            project_id: log.projectId || log.project_id,
            user_id: log.userId || log.user_id,
            task: log.task,
            date: log.date,
            week_ending: log.weekEnding || log.week_ending,
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

        // Log activity
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && dbLog.project_id) {
                const { data: project } = await supabase
                    .from('projects')
                    .select('customer_id, name')
                    .eq('id', dbLog.project_id)
                    .single();

                if (project) {
                    const isNew = !log.id;
                    const { activityStorage } = await import('./activity-storage');

                    await activityStorage.createActivity({
                        customer_id: project.customer_id,
                        user_id: user.id,
                        activity_type: 'time_logged',
                        entity_type: 'time_log',
                        entity_id: data.id,
                        description: isNew ? `Logged ${dbLog.hours}h on "${project.name}"` : `Updated time log on "${project.name}"`,
                        metadata: { hours: dbLog.hours, project_name: project.name }
                    });
                }
            }
        } catch (err) {
            console.error('Failed to log activity:', err);
        }

        return this.mapToFrontend(data as TimeLogDB);
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

    private mapToFrontend(data: TimeLogDB): TimeLog {
        return {
            ...data,
            projectId: data.project_id,
            userId: data.user_id,
            projectName: data.projects?.name,
            userName: data.users?.name,
            weekEnding: data.week_ending,
            createdAt: data.created_at || new Date().toISOString(),
        };
    }
}

export const timeLogStorage = new TimeLogStorage();
