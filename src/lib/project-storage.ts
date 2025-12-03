import { supabase } from './supabase';

export type ProjectType = 'Implementation' | 'Optimization' | 'Support' | 'Custom Dev' | 'T&M' | 'Fixed' | 'Change Order' | 'MSP';
export type ProjectStatus = 'active' | 'completed' | 'on-hold';

export interface Project {
    id: string;
    name: string;
    customerId: string;
    customer_id?: string; // DB column
    customerName?: string;
    projectType: ProjectType;
    project_type?: ProjectType; // DB column
    status: ProjectStatus;
    budget: number;
    hoursBudget?: number;
    hours_budget?: number; // DB column
    startDate: string;
    start_date?: string; // DB column
    endDate: string;
    end_date?: string; // DB column
    description?: string;
    createdAt: string;
    created_at?: string; // DB column
}

interface ProjectDB {
    id: string;
    name: string;
    customer_id: string;
    project_type: ProjectType;
    status: ProjectStatus;
    budget: number;
    hours_budget?: number;
    start_date: string;
    end_date: string;
    description?: string;
    created_at?: string;
}

class ProjectStorage {
    async getProjects(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('name');

        if (error) throw error;
        return (data || []).map((p: ProjectDB) => this.mapToFrontend(p));
    }

    async getProjectsByCustomer(customerId: string): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('customer_id', customerId);

        if (error) throw error;
        return (data || []).map((p: ProjectDB) => this.mapToFrontend(p));
    }

    async saveProject(project: Partial<Project>): Promise<Project> {
        const dbProject = {
            id: project.id,
            name: project.name,
            customer_id: project.customerId || project.customer_id,
            project_type: project.projectType || project.project_type,
            status: project.status,
            budget: project.budget,
            hours_budget: project.hoursBudget || project.hours_budget,
            start_date: project.startDate || project.start_date,
            end_date: project.endDate || project.end_date,
            description: project.description,
        };

        const { data, error } = await supabase
            .from('projects')
            .upsert(dbProject)
            .select()
            .single();

        if (error) throw error;

        // Log activity
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && dbProject.customer_id) {
                const isNew = !project.id;
                // Import dynamically to avoid circular dependency if any, though here it's fine
                const { activityStorage } = await import('./activity-storage');

                await activityStorage.createActivity({
                    customer_id: dbProject.customer_id,
                    user_id: user.id,
                    activity_type: isNew ? 'project_created' : 'project_updated',
                    entity_type: 'project',
                    entity_id: data.id,
                    description: isNew ? `Created project "${dbProject.name}"` : `Updated project "${dbProject.name}"`,
                    metadata: { project_name: dbProject.name }
                });
            }
        } catch (err) {
            console.error('Failed to log activity:', err);
        }

        return this.mapToFrontend(data as ProjectDB);
    }

    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async updateProjectStatus(id: string, status: ProjectStatus): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    }

    async clear(): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;
    }

    private mapToFrontend(data: ProjectDB): Project {
        return {
            ...data,
            customerId: data.customer_id,
            projectType: data.project_type,
            hoursBudget: data.hours_budget,
            startDate: data.start_date,
            endDate: data.end_date,
            createdAt: data.created_at || new Date().toISOString(),
        };
    }
}

export const projectStorage = new ProjectStorage();
