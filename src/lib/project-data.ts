export interface Task {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: 'completed' | 'in-progress' | 'upcoming' | 'delayed';
    progress: number;
    phase: string;
    dependencies: string[]; // Array of task IDs this task depends on
    parallelGroup?: string; // Tasks with same group can run in parallel
}

export interface Phase {
    id: string;
    name: string;
    order: number;
    color: string;
}

export interface ProjectData {
    id: string;
    name: string;
    status: 'active' | 'completed' | 'on-hold';
    startDate: string;
    endDate: string;
    phases: Phase[];
    tasks: Task[];
}

export const MOCK_PROJECTS: ProjectData[] = [
    {
        id: 'PROJ-001',
        name: 'Customer Portal Development',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-04-21',
        phases: [
            { id: 'phase-1', name: 'Initiation', order: 1, color: '#3b82f6' },
            { id: 'phase-2', name: 'Planning', order: 2, color: '#8b5cf6' },
            { id: 'phase-3', name: 'Execution', order: 3, color: '#10b981' },
            { id: 'phase-4', name: 'Testing', order: 4, color: '#f59e0b' },
            { id: 'phase-5', name: 'Deployment', order: 5, color: '#06b6d4' },
        ],
        tasks: [
            {
                id: 'TASK-1',
                name: 'Project Kickoff',
                phase: 'Initiation',
                startDate: '2024-01-01',
                endDate: '2024-01-07',
                status: 'completed',
                progress: 100,
                dependencies: [],
            },
            {
                id: 'TASK-2',
                name: 'Requirements Gathering',
                phase: 'Initiation',
                startDate: '2024-01-08',
                endDate: '2024-01-21',
                status: 'completed',
                progress: 100,
                dependencies: ['TASK-1'],
            },
            {
                id: 'TASK-3',
                name: 'Design Phase',
                phase: 'Planning',
                startDate: '2024-01-22',
                endDate: '2024-02-11',
                status: 'completed',
                progress: 100,
                dependencies: ['TASK-2'],
            },
            {
                id: 'TASK-4',
                name: 'Frontend Development',
                phase: 'Execution',
                startDate: '2024-02-12',
                endDate: '2024-03-10',
                status: 'in-progress',
                progress: 70,
                dependencies: ['TASK-3'],
                parallelGroup: 'development',
            },
            {
                id: 'TASK-5',
                name: 'Backend Development',
                phase: 'Execution',
                startDate: '2024-02-12',
                endDate: '2024-03-15',
                status: 'in-progress',
                progress: 65,
                dependencies: ['TASK-3'],
                parallelGroup: 'development',
            },
            {
                id: 'TASK-6',
                name: 'Integration Testing',
                phase: 'Testing',
                startDate: '2024-03-16',
                endDate: '2024-04-05',
                status: 'upcoming',
                progress: 0,
                dependencies: ['TASK-4', 'TASK-5'],
            },
            {
                id: 'TASK-7',
                name: 'User Acceptance Testing',
                phase: 'Testing',
                startDate: '2024-03-25',
                endDate: '2024-04-14',
                status: 'upcoming',
                progress: 0,
                dependencies: ['TASK-4', 'TASK-5'],
                parallelGroup: 'testing',
            },
            {
                id: 'TASK-8',
                name: 'Deployment to Production',
                phase: 'Deployment',
                startDate: '2024-04-15',
                endDate: '2024-04-21',
                status: 'upcoming',
                progress: 0,
                dependencies: ['TASK-6', 'TASK-7'],
            },
        ],
    },
    {
        id: 'PROJ-002',
        name: 'Mobile App Enhancement',
        status: 'active',
        startDate: '2024-02-01',
        endDate: '2024-05-15',
        phases: [
            { id: 'phase-1', name: 'Initiation', order: 1, color: '#3b82f6' },
            { id: 'phase-2', name: 'Planning', order: 2, color: '#8b5cf6' },
            { id: 'phase-3', name: 'Execution', order: 3, color: '#10b981' },
            { id: 'phase-4', name: 'Testing', order: 4, color: '#f59e0b' },
            { id: 'phase-5', name: 'Deployment', order: 5, color: '#06b6d4' },
        ],
        tasks: [
            {
                id: 'TASK-M1',
                name: 'Kickoff & Planning',
                phase: 'Initiation',
                startDate: '2024-02-01',
                endDate: '2024-02-10',
                status: 'completed',
                progress: 100,
                dependencies: [],
            },
            {
                id: 'TASK-M2',
                name: 'UI/UX Design',
                phase: 'Planning',
                startDate: '2024-02-11',
                endDate: '2024-03-01',
                status: 'completed',
                progress: 100,
                dependencies: ['TASK-M1'],
            },
            {
                id: 'TASK-M3',
                name: 'iOS Development',
                phase: 'Execution',
                startDate: '2024-03-02',
                endDate: '2024-04-15',
                status: 'in-progress',
                progress: 45,
                dependencies: ['TASK-M2'],
                parallelGroup: 'mobile-dev',
            },
            {
                id: 'TASK-M4',
                name: 'Android Development',
                phase: 'Execution',
                startDate: '2024-03-02',
                endDate: '2024-04-15',
                status: 'in-progress',
                progress: 40,
                dependencies: ['TASK-M2'],
                parallelGroup: 'mobile-dev',
            },
            {
                id: 'TASK-M5',
                name: 'QA Testing',
                phase: 'Testing',
                startDate: '2024-04-16',
                endDate: '2024-05-05',
                status: 'upcoming',
                progress: 0,
                dependencies: ['TASK-M3', 'TASK-M4'],
            },
            {
                id: 'TASK-M6',
                name: 'App Store Release',
                phase: 'Deployment',
                startDate: '2024-05-06',
                endDate: '2024-05-15',
                status: 'upcoming',
                progress: 0,
                dependencies: ['TASK-M5'],
            },
        ],
    },
];
