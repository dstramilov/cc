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

class ProjectStorage {
    async getProjects(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('name');

        if (error) throw error;
        return (data || []).map(this.mapToFrontend);
    }

    async getProjectsByCustomer(customerId: string): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('customer_id', customerId);

        if (error) throw error;
        return (data || []).map(this.mapToFrontend);
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
        return this.mapToFrontend(data);
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

    private mapToFrontend(data: any): Project {
        return {
            ...data,
            customerId: data.customer_id,
            projectType: data.project_type,
            hoursBudget: data.hours_budget,
            startDate: data.start_date,
            endDate: data.end_date,
            createdAt: data.created_at,
        };
    }
}

export const projectStorage = new ProjectStorage();
