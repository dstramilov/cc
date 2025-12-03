import * as XLSX from 'xlsx';
import { MeetingNote } from './document-storage';
import { Project } from './project-storage';
import { Customer } from './customer-storage';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportProjects = (projects: Project[]) => {
    const data = projects.map(p => ({
        'Project Name': p.name,
        'Customer': p.customerName || p.customerId,
        'Type': p.projectType,
        'Status': p.status,
        'Budget ($)': p.budget,
        'Hours Budget': p.hoursBudget || 0,
        'Start Date': new Date(p.startDate).toLocaleDateString(),
        'End Date': p.endDate ? new Date(p.endDate).toLocaleDateString() : '-',
        'Description': p.description || '-'
    }));

    exportToExcel(data, `Projects_Export_${new Date().toISOString().split('T')[0]}`);
};

export const exportCustomers = (customers: Customer[]) => {
    const data = customers.map(c => ({
        'Customer Name': c.name,
        'Status': c.status,
        'Email': c.email || '-',
        'Joined Date': c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'
    }));

    exportToExcel(data, `Customers_Export_${new Date().toISOString().split('T')[0]}`);
};

export const exportMeetingNotes = (notes: MeetingNote[]) => {
    const data = notes.map(note => ({
        Title: note.title,
        Date: new Date(note.date).toLocaleDateString(),
        Type: note.type === 'minutes' ? 'Minutes' : 'Transcript',
        Content: note.content || '(Transcript File)',
        'File Name': note.fileName || '-',
        'Upload Date': new Date(note.uploadDate).toLocaleString(),
    }));

    exportToExcel(data, `Meeting_Notes_${new Date().toISOString().split('T')[0]}`);
};

export const exportTimelineData = (project: any, tasks: any[]) => {
    const data = tasks.map(task => ({
        'Task Name': task.name,
        'Status': task.status,
        'Start Date': new Date(task.start).toLocaleDateString(),
        'End Date': new Date(task.end).toLocaleDateString(),
        'Assigned To': task.assignee || 'Unassigned',
        'Progress': `${task.progress}%`,
        'Phase': task.phase || '-',
    }));

    exportToExcel(data, `${project.name}_Timeline_${new Date().toISOString().split('T')[0]}`);
};

export const exportTimeLogs = (logs: any[]) => {
    const data = logs.map(log => ({
        'Project': log.projectName,
        'User': log.userName,
        'Week Ending': new Date(log.weekEnding).toLocaleDateString(),
        'Billable Hours': log.billableHours,
        'Non-Billable Hours': log.nonBillableHours,
        'Total Hours': log.totalHours,
        'Description': log.description || '-',
    }));

    exportToExcel(data, `Time_Logs_${new Date().toISOString().split('T')[0]}`);
};
