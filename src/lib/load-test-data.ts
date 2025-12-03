import { supabase } from './supabase';
import { customerStorage } from './customer-storage';
import { userStorage } from './user-storage';
import { projectStorage } from './project-storage';
import { timeLogStorage } from './time-log-storage';
import { todoStorage } from './todo-storage';

// Helper to generate random date within a range
const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

// Helper to add months to a date
const addMonths = (dateStr: string, months: number) => {
    const date = new Date(dateStr);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
};

export async function loadTestData() {
    console.log('Starting comprehensive test data load with ALL variations...\n');

    try {
        // 1. Clear existing data (in correct order to respect FK constraints)
        console.log('Clearing existing data...');
        await supabase.from('activities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('todos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await timeLogStorage.clear();
        await projectStorage.clear();
        await userStorage.clear();
        await customerStorage.clear();
        console.log('✓ Cleared existing data\n');

        // 2. Generate Customers
        const activeCustomers = Array.from({ length: 8 }, (_, i) => ({
            id: crypto.randomUUID(),
            externalId: `ACT-${String(i + 1).padStart(3, '0')}`,
            name: `Active Customer ${String(i + 1).padStart(3, '0')}`,
            email: `contact@active-customer${i + 1}.com`,
            domain: `active-customer${i + 1}.com`,
            status: 'active' as const,
            primaryUserId: crypto.randomUUID(),
            createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString()
        }));

        const inactiveCustomers = Array.from({ length: 2 }, (_, i) => ({
            id: crypto.randomUUID(),
            externalId: `INA-${String(i + 1).padStart(3, '0')}`,
            name: `Inactive Customer ${String(i + 1).padStart(3, '0')}`,
            email: `contact@inactive-customer${i + 1}.com`,
            domain: `inactive-customer${i + 1}.com`,
            status: 'inactive' as const,
            primaryUserId: crypto.randomUUID(),
            createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        }));

        const allCustomers = [...activeCustomers, ...inactiveCustomers];

        // 3. Generate Users
        const adminUsers = [{
            id: crypto.randomUUID(),
            name: 'Admin User',
            email: 'admin@antigravity.com',
            role: 'admin' as const,
            status: 'active' as const,
            createdAt: new Date().toISOString()
        }];

        const pmUsers = [{
            id: crypto.randomUUID(),
            name: 'Project Manager',
            email: 'pm@antigravity.com',
            role: 'pm' as const,
            status: 'active' as const,
            createdAt: new Date().toISOString()
        }];

        const customerUsers = allCustomers.map((cust) => ({
            id: cust.primaryUserId,
            name: `Contact for ${cust.name}`,
            email: `contact@${cust.domain}`,
            role: 'customer' as const,
            customerId: cust.id,
            status: cust.status,
            createdAt: cust.createdAt
        }));

        const allUsers = [...adminUsers, ...pmUsers, ...customerUsers];

        // 4. Generate Projects
        const projectTypes = ['T&M', 'Fixed', 'Change Order', 'MSP'] as const;
        const projectStatuses = ['active', 'on-hold', 'completed'] as const;
        const allProjects = [];

        for (const customer of allCustomers) {
            // 1-3 projects per customer
            const numProjects = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numProjects; i++) {
                const type = projectTypes[Math.floor(Math.random() * projectTypes.length)];
                const status = projectStatuses[Math.floor(Math.random() * projectStatuses.length)];
                const startDate = getRandomDate(new Date('2023-01-01'), new Date('2024-06-30'));
                const endDate = addMonths(startDate, 6 + Math.floor(Math.random() * 12));
                const budget = Math.floor(Math.random() * 150000) + 20000;

                allProjects.push({
                    id: crypto.randomUUID(),
                    name: `${customer.name} - ${type} ${i + 1}`,
                    customerId: customer.id,
                    projectType: type,
                    status: status,
                    budget: budget,
                    hoursBudget: Math.floor(budget / 150),
                    startDate: startDate,
                    endDate: endDate,
                    description: `${type} project for ${customer.name}`,
                    createdAt: startDate // Project created on start date
                });
            }
        }

        // 5. Generate Time Logs & Todos & Activities
        const timeLogs = [];
        const todos = [];
        const activities = [];

        const tasks = ['Design', 'Development', 'Testing', 'Meeting', 'Planning'];
        const todoTitles = ['Review Requirements', 'Sign off Design', 'UAT Testing', 'Approve Budget', 'Weekly Sync'];

        for (const project of allProjects) {
            // Time Logs
            const numLogs = Math.floor(Math.random() * 10) + 2;
            const projectUsers = [adminUsers[0], pmUsers[0]]; // Internal users

            for (let i = 0; i < numLogs; i++) {
                const user = projectUsers[Math.floor(Math.random() * projectUsers.length)];
                const date = getRandomDate(new Date(project.startDate), new Date());

                // Calculate week ending (Friday)
                const d = new Date(date);
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 4;
                const weekEnding = new Date(d.setDate(diff)).toISOString().split('T')[0];

                const logId = crypto.randomUUID();
                const hours = [2, 4, 8][Math.floor(Math.random() * 3)];

                timeLogs.push({
                    id: logId,
                    projectId: project.id,
                    userId: user.id,
                    task: tasks[Math.floor(Math.random() * tasks.length)],
                    description: `Worked on ${project.name}`,
                    date: date,
                    weekEnding: weekEnding,
                    hours: hours,
                    status: 'approved',
                    createdAt: new Date(date).toISOString()
                });

                // Activity for Time Log
                activities.push({
                    id: crypto.randomUUID(),
                    customer_id: project.customerId,
                    user_id: user.id,
                    activity_type: 'time_logged',
                    entity_type: 'time_log',
                    entity_id: logId,
                    description: `Logged ${hours}h on "${project.name}"`,
                    metadata: { hours: hours, project_name: project.name },
                    created_at: new Date(date).toISOString()
                });
            }

            // Todos
            const numTodos = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < numTodos; i++) {
                const title = todoTitles[Math.floor(Math.random() * todoTitles.length)];
                const status = Math.random() > 0.5 ? 'completed' : 'pending';
                const todoId = crypto.randomUUID();
                const createdDate = getRandomDate(new Date(project.startDate), new Date());

                todos.push({
                    id: todoId,
                    customer_id: project.customerId,
                    title: `${title} - ${project.name}`,
                    status: status,
                    due_date: addMonths(createdDate, 1),
                    created_at: new Date(createdDate).toISOString(),
                    created_by: pmUsers[0].id
                });

                // Activity for Todo Created
                activities.push({
                    id: crypto.randomUUID(),
                    customer_id: project.customerId,
                    user_id: pmUsers[0].id,
                    activity_type: 'todo_created',
                    entity_type: 'todo',
                    entity_id: todoId,
                    description: `Created task "${title}"`,
                    metadata: { title: title },
                    created_at: new Date(createdDate).toISOString()
                });

                if (status === 'completed') {
                    // Activity for Todo Completed (1 day later)
                    const completedDate = new Date(new Date(createdDate).getTime() + 86400000).toISOString();
                    activities.push({
                        id: crypto.randomUUID(),
                        customer_id: project.customerId,
                        user_id: pmUsers[0].id,
                        activity_type: 'todo_completed',
                        entity_type: 'todo',
                        entity_id: todoId,
                        description: `Completed task "${title}"`,
                        metadata: { title: title },
                        created_at: completedDate
                    });
                }
            }

            // Activity for Project Creation
            activities.push({
                id: crypto.randomUUID(),
                customer_id: project.customerId,
                user_id: pmUsers[0].id,
                activity_type: 'project_created',
                entity_type: 'project',
                entity_id: project.id,
                description: `Created project "${project.name}"`,
                metadata: { project_name: project.name },
                created_at: project.createdAt
            });
        }

        // 6. Bulk Insert
        console.log('Saving to Supabase...');

        await Promise.all(allCustomers.map(c => customerStorage.saveCustomer(c)));
        await Promise.all(allUsers.map(u => userStorage.saveUser(u)));
        await Promise.all(allProjects.map(p => projectStorage.saveProject(p)));

        // Bulk insert for performance
        const chunk = (arr: any[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

        for (const batch of chunk(timeLogs, 50)) {
            await supabase.from('time_logs').insert(batch.map(l => ({
                id: l.id,
                project_id: l.projectId,
                user_id: l.userId,
                task: l.task,
                date: l.date,
                week_ending: l.weekEnding,
                hours: l.hours,
                status: l.status,
                description: l.description,
                created_at: l.createdAt
            })));
        }

        for (const batch of chunk(todos, 50)) {
            await supabase.from('todos').insert(batch);
        }

        for (const batch of chunk(activities, 50)) {
            await supabase.from('activities').insert(batch);
        }

        console.log('\n✅ Test data load complete!');
        console.log(`Summary:`);
        console.log(`  • Customers: ${allCustomers.length}`);
        console.log(`  • Users: ${allUsers.length}`);
        console.log(`  • Projects: ${allProjects.length}`);
        console.log(`  • Time Logs: ${timeLogs.length}`);
        console.log(`  • Todos: ${todos.length}`);
        console.log(`  • Activities: ${activities.length}`);

        return { success: true };

    } catch (error) {
        console.error('\n❌ Failed to load test data:', error);
        return { success: false, error };
    }
}
