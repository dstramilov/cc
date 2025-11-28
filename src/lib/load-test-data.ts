import { customerStorage } from './customer-storage';
import { userStorage } from './user-storage';
import { projectStorage } from './project-storage';
import { timeLogStorage } from './time-log-storage';

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
        await timeLogStorage.clear();  // Clear time logs first (has FK to projects/users)
        await projectStorage.clear();  // Clear projects second (has FK to customers)
        await userStorage.clear();     // Clear users second (has FK to customers)
        await customerStorage.clear(); // Clear customers last
        console.log('✓ Cleared existing data\n');

        // 2. Generate Customers with BOTH status variations
        const activeCustomers = Array.from({ length: 12 }, (_, i) => ({
            id: crypto.randomUUID(),
            externalId: `ACT-${String(i + 1).padStart(3, '0')}`,
            name: `Active Customer ${String(i + 1).padStart(3, '0')}`,
            email: `contact@active-customer${i + 1}.com`,
            domain: `active-customer${i + 1}.com`,
            status: 'active' as const,
            primaryUserId: crypto.randomUUID(),
            createdAt: new Date().toISOString()
        }));

        const inactiveCustomers = Array.from({ length: 3 }, (_, i) => ({
            id: crypto.randomUUID(),
            externalId: `INA-${String(i + 1).padStart(3, '0')}`,
            name: `Inactive Customer ${String(i + 1).padStart(3, '0')}`,
            email: `contact@inactive-customer${i + 1}.com`,
            domain: `inactive-customer${i + 1}.com`,
            status: 'inactive' as const,
            primaryUserId: crypto.randomUUID(),
            createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year ago
        }));

        const allCustomers = [...activeCustomers, ...inactiveCustomers];
        console.log(`Generated ${activeCustomers.length} active + ${inactiveCustomers.length} inactive customers`);

        // 3. Generate Users with ALL role and status variations
        const adminUsers = [
            {
                id: crypto.randomUUID(),
                name: 'Admin User (Active)',
                email: 'admin@antigravity.com',
                role: 'admin' as const,
                status: 'active' as const,
                createdAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                name: 'Admin User (Inactive)',
                email: 'admin-inactive@antigravity.com',
                role: 'admin' as const,
                status: 'inactive' as const,
                createdAt: new Date().toISOString()
            }
        ];

        const pmUsers = [
            {
                id: crypto.randomUUID(),
                name: 'Project Manager (Active)',
                email: 'pm@antigravity.com',
                role: 'pm' as const,
                status: 'active' as const,
                createdAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                name: 'Project Manager (Inactive)',
                email: 'pm-inactive@antigravity.com',
                role: 'pm' as const,
                status: 'inactive' as const,
                createdAt: new Date().toISOString()
            }
        ];

        // Customer users - one for each customer (matching primaryUserId)
        const customerUsers = allCustomers.map((cust) => ({
            id: cust.primaryUserId,
            name: `Contact for ${cust.name}`,
            email: `contact@${cust.domain}`,
            role: 'customer' as const,
            customerId: cust.id,
            status: cust.status, // Match customer status
            createdAt: cust.createdAt
        }));

        const allUsers = [...adminUsers, ...pmUsers, ...customerUsers];
        console.log(`Generated ${adminUsers.length} admins + ${pmUsers.length} PMs + ${customerUsers.length} customers`);

        // 4. Generate Projects with ALL type and status variations
        const projectTypes = ['T&M', 'Fixed', 'Change Order', 'MSP'] as const;
        const projectStatuses = ['active', 'on-hold', 'completed'] as const;

        // Ensure we have at least one project for EVERY combination
        const guaranteedProjects = [];
        let projectCounter = 1;

        // Create one project for each type × status combination (4 × 3 = 12 projects)
        for (const type of projectTypes) {
            for (const status of projectStatuses) {
                const customer = activeCustomers[Math.floor(Math.random() * activeCustomers.length)];
                const startDate = getRandomDate(new Date('2023-01-01'), new Date('2024-06-30'));
                const endDate = addMonths(startDate, 6 + Math.floor(Math.random() * 12));

                const budget = Math.floor(Math.random() * 150000) + 20000; // 20k - 170k
                const hoursBudget = Math.floor(budget / 150); // Assuming $150/hour rate

                guaranteedProjects.push({
                    id: crypto.randomUUID(),
                    name: `${type} - ${status.toUpperCase()} - Project ${projectCounter}`,
                    customerId: customer.id,
                    projectType: type,
                    status: status,
                    budget: budget,
                    hoursBudget: hoursBudget,
                    startDate: startDate,
                    endDate: endDate,
                    description: `${type} project with ${status} status for ${customer.name}`,
                    createdAt: new Date().toISOString()
                });
                projectCounter++;
            }
        }

        // Add additional random projects to reach ~50 total
        const additionalProjects = Array.from({ length: 38 }, (_, i) => {
            const customer = allCustomers[Math.floor(Math.random() * allCustomers.length)];
            const type = projectTypes[Math.floor(Math.random() * projectTypes.length)];
            const status = projectStatuses[Math.floor(Math.random() * projectStatuses.length)];
            const startDate = getRandomDate(new Date('2023-01-01'), new Date('2024-12-31'));
            const endDate = addMonths(startDate, 3 + Math.floor(Math.random() * 18));

            const budget = Math.floor(Math.random() * 200000) + 10000; // 10k - 210k
            const hoursBudget = Math.floor(budget / 150); // Assuming $150/hour rate

            return {
                id: crypto.randomUUID(),
                name: `${customer.name} - ${type} Project ${projectCounter + i}`,
                customerId: customer.id,
                projectType: type,
                status: status,
                budget: budget,
                hoursBudget: hoursBudget,
                startDate: startDate,
                endDate: endDate,
                description: `${type} project for ${customer.name}`,
                createdAt: new Date().toISOString()
            };
        });

        const allProjects = [...guaranteedProjects, ...additionalProjects];
        console.log(`Generated ${guaranteedProjects.length} guaranteed variations + ${additionalProjects.length} random projects = ${allProjects.length} total\n`);

        // 5. Generate Time Logs
        const timeLogs = [];
        const tasks = ['Design', 'Development', 'Testing', 'Meeting', 'Planning', 'Documentation', 'Deployment', 'Bug Fix'];

        for (const project of allProjects) {
            // Generate 5-20 logs per project
            const numLogs = Math.floor(Math.random() * 15) + 5;
            const projectUsers = allUsers.filter(u => u.role !== 'customer'); // Only internal users log time

            for (let i = 0; i < numLogs; i++) {
                const user = projectUsers[Math.floor(Math.random() * projectUsers.length)];
                const date = getRandomDate(new Date(project.startDate), new Date() < new Date(project.endDate) ? new Date() : new Date(project.endDate));

                timeLogs.push({
                    id: crypto.randomUUID(),
                    projectId: project.id,
                    userId: user.id,
                    task: tasks[Math.floor(Math.random() * tasks.length)],
                    date: date,
                    hours: Math.floor(Math.random() * 8) + 0.5,
                    status: (Math.random() > 0.8 ? 'rejected' : Math.random() > 0.3 ? 'approved' : 'pending') as 'pending' | 'approved' | 'rejected',
                    description: `Worked on ${project.name}`,
                    createdAt: new Date().toISOString()
                });
            }
        }
        console.log(`Generated ${timeLogs.length} time logs`);

        // 5. Save all data to Supabase
        console.log('Saving to Supabase...');

        console.log('  → Saving customers...');
        await Promise.all(allCustomers.map(c => customerStorage.saveCustomer(c)));

        console.log('  → Saving users...');
        await Promise.all(allUsers.map(u => userStorage.saveUser(u)));

        console.log('  → Saving projects...');
        await Promise.all(allProjects.map(p => projectStorage.saveProject(p)));

        console.log('  → Saving time logs...');
        // Save in chunks to avoid rate limits or payload size issues
        const chunkSize = 50;
        for (let i = 0; i < timeLogs.length; i += chunkSize) {
            const chunk = timeLogs.slice(i, i + chunkSize);
            await Promise.all(chunk.map(l => timeLogStorage.saveTimeLog(l)));
        }

        console.log('\n✅ Test data load complete!');
        console.log('\nSummary:');
        console.log(`  • Customers: ${allCustomers.length} (${activeCustomers.length} active, ${inactiveCustomers.length} inactive)`);
        console.log(`  • Users: ${allUsers.length} (${adminUsers.length} admin, ${pmUsers.length} PM, ${customerUsers.length} customer)`);
        console.log(`  • Projects: ${allProjects.length} (all 4 types × all 3 statuses covered)`);

        return {
            success: true,
            counts: {
                customers: allCustomers.length,
                users: allUsers.length,
                projects: allProjects.length,
                timeLogs: timeLogs.length
            }
        };

    } catch (error) {
        console.error('\n❌ Failed to load test data:', error);
        return { success: false, error };
    }
}
