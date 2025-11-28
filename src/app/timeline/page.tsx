"use client"

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Circle, AlertCircle, Upload, GitBranch, ArrowRight, FileText, Download, ArrowUpFromLine, ArrowDownToLine } from "lucide-react";
import { CSVUpload } from "@/components/timeline/csv-upload";
import { MOCK_PROJECTS, ProjectData } from "@/lib/project-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@/lib/user-context";
import { DocumentUpload } from "@/components/documents/document-upload";
import { DocumentList } from "@/components/documents/document-list";
import { exportTimelineData } from "@/lib/export-utils";
import { FilterBar } from "@/components/filter-bar";
import { useFilter } from "@/context/filter-context";

const getStatusIcon = (status: string) => {
    switch (status) {
        case "completed":
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case "in-progress":
            return <Clock className="h-4 w-4 text-blue-600" />;
        case "delayed":
            return <AlertCircle className="h-4 w-4 text-red-600" />;
        default:
            return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case "completed":
            return <Badge className="bg-green-600 hover:bg-green-700 shadow-sm">Completed</Badge>;
        case "in-progress":
            return <Badge className="bg-blue-600 hover:bg-blue-700 shadow-sm">In Progress</Badge>;
        case "delayed":
            return <Badge variant="destructive" className="shadow-sm">Delayed</Badge>;
        default:
            return <Badge variant="secondary" className="shadow-sm">Upcoming</Badge>;
    }
};

export default function TimelinePage() {
    const [projects, setProjects] = useState<ProjectData[]>(MOCK_PROJECTS);
    const [showUpload, setShowUpload] = useState(false);
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);
    const [documentRefresh, setDocumentRefresh] = useState(0);
    const { canUpload, canManageDocuments } = useUser();
    const { selectedProjectIds } = useFilter();

    // Determine which project to show based on global filter
    // If multiple selected, we show the first one for now (Timeline is single-project view)
    // If none selected, we show the first available project
    const selectedProjectId = selectedProjectIds.length > 0 ? selectedProjectIds[0] : projects[0]?.id;

    // Find the project data. If ID matches a mock project, use it.
    // If not (e.g. real project ID from DB), we might not have timeline data for it yet.
    // For this demo, we'll fallback to the first mock project if the selected ID isn't found in mock data,
    // or just show empty state.
    // Let's try to find it, or default to first if not found (to keep the view populated for demo)
    const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    const handleCSVImport = (csvData: any[]) => {
        // Parse CSV data
        const projectId = csvData[0]?.ProjectID || `PROJ-${Date.now()}`;

        const projectData: ProjectData = {
            id: projectId,
            name: csvData[0]?.ProjectID || 'Imported Project',
            status: 'active',
            startDate: csvData[0]?.StartDate || new Date().toISOString().split('T')[0],
            endDate: csvData[csvData.length - 1]?.EndDate || new Date().toISOString().split('T')[0],
            phases: Array.from(new Set(csvData.map(row => row.Phase))).map((phase, idx) => ({
                id: `phase-${idx}`,
                name: phase as string,
                order: idx + 1,
                color: '#3b82f6',
            })),
            tasks: csvData.map(row => ({
                id: row.TaskID,
                name: row.TaskName,
                phase: row.Phase,
                startDate: row.StartDate,
                endDate: row.EndDate,
                status: row.Status as any,
                progress: parseInt(row.Progress) || 0,
                dependencies: row.Dependencies ? row.Dependencies.split(',').map((d: string) => d.trim()) : [],
                parallelGroup: row.ParallelGroup || undefined,
            })),
        };

        setProjects(prevProjects => {
            const existingIndex = prevProjects.findIndex(p => p.id === projectId);
            if (existingIndex >= 0) {
                // Update existing project
                const updatedProjects = [...prevProjects];
                updatedProjects[existingIndex] = projectData;
                return updatedProjects;
            } else {
                // Add new project
                return [...prevProjects, projectData];
            }
        });

        setShowUpload(false);
    };

    const downloadTimelineTemplate = () => {
        const template = [
            ['ProjectID', 'TaskID', 'TaskName', 'Phase', 'StartDate', 'EndDate', 'Status', 'Progress', 'Dependencies', 'ParallelGroup'],
            ['PROJ-001', 'T1', 'Requirements Gathering', 'Discovery', '2024-01-01', '2024-01-14', 'completed', '100', '', ''],
            ['PROJ-001', 'T2', 'Design Mockups', 'Design', '2024-01-15', '2024-01-28', 'in-progress', '60', 'T1', ''],
            ['PROJ-001', 'T3', 'Database Setup', 'Development', '2024-01-29', '2024-02-05', 'pending', '0', 'T2', 'P1'],
        ];

        const csvContent = template.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'timeline_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!currentProject) return null;

    const projectStart = new Date(currentProject.startDate);
    const projectEnd = new Date(currentProject.endDate);
    const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    const overallProgress = Math.round(
        currentProject.tasks.reduce((sum, t) => sum + t.progress, 0) / currentProject.tasks.length
    );

    // Group tasks by phase
    const tasksByPhase = currentProject.phases.map(phase => ({
        phase,
        tasks: currentProject.tasks.filter(t => t.phase === phase.name),
    }));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header with Apple-like styling */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                            Project Timeline
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Visual timeline with dependencies and parallel execution
                        </p>
                    </div>
                </div>

                {/* Unified Filter Bar */}
                <FilterBar />

                {/* Actions Bar */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-sm font-medium text-muted-foreground">
                                Viewing: <span className="text-foreground">{currentProject.name}</span>
                            </div>
                            <div className="flex gap-2">
                                {canUpload && (
                                    <Dialog open={showUpload} onOpenChange={setShowUpload}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="icon" title="Import CSV">
                                                <ArrowUpFromLine className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <div className="flex items-center justify-between">
                                                    <DialogTitle>Import/Update Project</DialogTitle>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={downloadTimelineTemplate}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download Template
                                                    </Button>
                                                </div>
                                            </DialogHeader>
                                            <CSVUpload onDataParsed={handleCSVImport} />
                                        </DialogContent>
                                    </Dialog>
                                )}
                                <Button variant="outline" size="icon" title="Export CSV" onClick={() => exportTimelineData(currentProject, currentProject.tasks)}>
                                    <ArrowDownToLine className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Project Overview */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <CardHeader>
                        <CardTitle className="text-xl">{currentProject.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                            <span>{projectStart.toLocaleDateString()} - {projectEnd.toLocaleDateString()}</span>
                            <span className="text-xs">•</span>
                            <span>{currentProject.tasks.length} tasks</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Overall Progress</span>
                                <span className="font-semibold text-blue-600">{overallProgress}%</span>
                            </div>
                            <Progress value={overallProgress} className="h-3 shadow-inner" />
                        </div>
                    </CardContent>
                </Card>

                {/* Project Documents */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Project Documents
                                </CardTitle>
                                <CardDescription>Blueprints and requirements documents</CardDescription>
                            </div>
                            {canManageDocuments && (
                                <Dialog open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Document
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Upload Project Document</DialogTitle>
                                        </DialogHeader>
                                        <DocumentUpload
                                            projectId={currentProject.id}
                                            onUploadComplete={() => {
                                                setDocumentRefresh(prev => prev + 1);
                                                setShowDocumentUpload(false);
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DocumentList projectId={currentProject.id} refreshTrigger={documentRefresh} />
                    </CardContent>
                </Card>

                {/* Gantt Chart with Dependencies */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <GitBranch className="h-5 w-5 text-blue-600" />
                                    Waterfall Timeline with Dependencies
                                </CardTitle>
                                <CardDescription>Visual representation showing task relationships and parallel execution</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {tasksByPhase.map(({ phase, tasks }) => (
                                tasks.length > 0 && (
                                    <div key={phase.id} className="space-y-3">
                                        {/* Phase Header */}
                                        <div className="flex items-center gap-3 pb-2">
                                            <div
                                                className="w-1 h-8 rounded-full"
                                                style={{ backgroundColor: phase.color }}
                                            />
                                            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                                                {phase.name}
                                            </h3>
                                        </div>

                                        {/* Tasks in Phase */}
                                        {tasks.map((task) => {
                                            const startDays = Math.ceil(
                                                (new Date(task.startDate).getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
                                            );
                                            const duration = Math.ceil(
                                                (new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)
                                            );
                                            const leftPercent = (startDays / totalDays) * 100;
                                            const widthPercent = (duration / totalDays) * 100;

                                            return (
                                                <div key={task.id} className="space-y-1 pl-6">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(task.status)}
                                                            <span className="font-medium">{task.name}</span>
                                                            {task.parallelGroup && (
                                                                <Badge variant="outline" className="text-xs gap-1">
                                                                    <GitBranch className="h-3 w-3" />
                                                                    Parallel
                                                                </Badge>
                                                            )}
                                                            {task.dependencies.length > 0 && (
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <ArrowRight className="h-3 w-3" />
                                                                    Depends on: {task.dependencies.join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {task.progress}%
                                                        </span>
                                                    </div>
                                                    <div className="relative h-10 rounded-lg bg-gray-100 dark:bg-gray-800/50 shadow-inner">
                                                        <div
                                                            className={`absolute h-full rounded-lg transition-all shadow-md hover:shadow-lg ${task.status === "completed"
                                                                ? "bg-gradient-to-r from-green-500 to-green-600"
                                                                : task.status === "in-progress"
                                                                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                                                    : task.status === "delayed"
                                                                        ? "bg-gradient-to-r from-red-500 to-red-600"
                                                                        : "bg-gradient-to-r from-gray-400 to-gray-500"
                                                                }`}
                                                            style={{
                                                                left: `${leftPercent}%`,
                                                                width: `${widthPercent}%`,
                                                            }}
                                                        >
                                                            <div className="flex h-full items-center justify-center text-xs text-white font-semibold px-3">
                                                                {duration}d
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Task Details Table */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <CardHeader>
                        <CardTitle className="text-xl">Task Details</CardTitle>
                        <CardDescription>Complete list of tasks with dependencies</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">Task</TableHead>
                                        <TableHead className="font-semibold">Phase</TableHead>
                                        <TableHead className="font-semibold">Dates</TableHead>
                                        <TableHead className="font-semibold">Dependencies</TableHead>
                                        <TableHead className="font-semibold">Progress</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentProject.tasks.map((task) => (
                                        <TableRow key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                            <TableCell className="font-medium">{task.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                    {task.phase}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {task.dependencies.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {task.dependencies.map(dep => (
                                                            <Badge key={dep} variant="secondary" className="text-xs">
                                                                {dep}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={task.progress} className="h-2 w-20" />
                                                    <span className="text-xs text-muted-foreground w-10">{task.progress}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(task.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Legend */}
                <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Legend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm">Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">In Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Circle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Upcoming</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm">Delayed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-purple-600" />
                                <span className="text-sm">Parallel Tasks</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout >
    );
}
