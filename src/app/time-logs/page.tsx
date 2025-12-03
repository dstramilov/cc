"use client"

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpFromLine, ArrowDownToLine, Clock, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CSVUpload } from "@/components/timeline/csv-upload";
import { useUser } from "@/lib/user-context";
import { FilterBar } from "@/components/filter-bar";
import { useFilter } from "@/context/filter-context";
import { timeLogStorage, TimeLog } from "@/lib/time-log-storage";
import { projectStorage } from "@/lib/project-storage";
import { userStorage } from "@/lib/user-storage";



export default function TimeLogsPage() {
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const { canUpload } = useUser();
    const { selectedCustomerId, selectedProjectIds } = useFilter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [logsData, projectsData] = await Promise.all([
                timeLogStorage.getTimeLogs(),
                projectStorage.getProjects()
            ]);
            setLogs(logsData);
            setProjects(projectsData);
        } catch (error) {
            console.error("Failed to load time logs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logs based on customer first, then project selection
    const customerProjects = selectedCustomerId
        ? projects.filter(p => p.customerId === selectedCustomerId)
        : [];

    const customerProjectIds = customerProjects.map(p => p.id);
    const logsForCustomer = logs.filter(log => customerProjectIds.includes(log.projectId));

    const filteredLogs = selectedProjectIds.length > 0
        ? logsForCustomer.filter(log => selectedProjectIds.includes(log.projectId))
        : logsForCustomer;

    const handleCSVImport = async (data: any[]) => {
        try {
            // Fetch projects and users to map names to IDs
            const [projects, users] = await Promise.all([
                projectStorage.getProjects(),
                userStorage.getUsers()
            ]);

            const newLogs = [];
            for (const row of data) {
                const project = projects.find(p => p.name === row.Project);
                const user = users.find(u => u.name === row.User);

                if (project && user) {
                    const log = await timeLogStorage.saveTimeLog({
                        projectId: project.id,
                        userId: user.id,
                        task: row.Task || "Imported Task",
                        date: row.Date || new Date().toISOString().split('T')[0],
                        hours: parseFloat(row.Hours) || 0,
                        status: "pending"
                    });
                    newLogs.push(log);
                }
            }

            loadData(); // Reload to get full data with joins
            setShowUpload(false);
        } catch (error) {
            console.error("Failed to import logs:", error);
            alert("Failed to import logs. Please check the console for details.");
        }
    };

    const handleExport = () => {
        const csvContent = [
            ["ID", "Project", "Task", "User", "Date", "Hours", "Status"],
            ...filteredLogs.map(log => [log.id, log.projectName, log.task, log.userName, log.date, log.hours, log.status])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'time_logs.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Time Logs</h1>
                        <p className="text-muted-foreground">
                            Review and manage project time entries.
                        </p>
                    </div>
                </div>

                {/* Unified Filter Bar */}
                <FilterBar />

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Entries</CardTitle>
                                <CardDescription>
                                    Recent time logs from all projects.
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {canUpload && (
                                    <Dialog open={showUpload} onOpenChange={setShowUpload}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" title="Import CSV">
                                                <ArrowUpFromLine className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Import Time Logs</DialogTitle>
                                            </DialogHeader>
                                            <CSVUpload onDataParsed={handleCSVImport} />
                                        </DialogContent>
                                    </Dialog>
                                )}
                                <Button variant="outline" size="icon" onClick={handleExport} title="Export CSV">
                                    <ArrowDownToLine className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Task</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No time logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                        {log.date}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{log.projectName || 'Unknown Project'}</TableCell>
                                                <TableCell>{log.task}</TableCell>
                                                <TableCell>{log.userName || 'Unknown User'}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {log.hours.toFixed(1)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            log.status === 'approved' ? 'default' :
                                                                log.status === 'rejected' ? 'destructive' : 'secondary'
                                                        }
                                                    >
                                                        {log.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
