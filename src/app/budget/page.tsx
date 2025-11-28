"use client"

import React, { useEffect, useState } from "react";
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
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    ComposedChart
} from "recharts";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { FilterBar } from "@/components/filter-bar";
import { useFilter } from "@/context/filter-context";
import { projectStorage, Project } from "@/lib/project-storage";
import { timeLogStorage, TimeLog } from "@/lib/time-log-storage";

export default function BudgetPage() {
    const { selectedProjectIds } = useFilter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [projectsData, timeLogsData] = await Promise.all([
                    projectStorage.getProjects(),
                    timeLogStorage.getTimeLogs()
                ]);
                setProjects(projectsData);
                setTimeLogs(timeLogsData);
            } catch (error) {
                console.error("Failed to load budget data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filter data
    const filteredProjects = projects.filter(p =>
        selectedProjectIds.length === 0 || selectedProjectIds.includes(p.id)
    );
    const filteredProjectIds = filteredProjects.map(p => p.id);
    const filteredLogs = timeLogs.filter(log =>
        filteredProjectIds.includes(log.projectId) && log.status === 'approved'
    );

    // Calculate KPIs (Hours)
    const totalHoursBudget = filteredProjects.reduce((sum, p) => sum + (p.hoursBudget || 0), 0);
    const totalHoursUsed = filteredLogs.reduce((sum, log) => sum + log.hours, 0);
    const hoursRemaining = totalHoursBudget - totalHoursUsed;
    const percentUsed = totalHoursBudget > 0 ? Math.round((totalHoursUsed / totalHoursBudget) * 100) : 0;

    // Prepare Chart Data (Monthly Hours)
    // 1. Initialize map with all relevant months
    const monthlyDataMap: Record<string, { month: string, actual: number, budget: number, sortKey: string }> = {};

    // Helper to get month keys between two dates
    const getMonthKeys = (start: Date, end: Date) => {
        const keys = [];
        const current = new Date(start.getFullYear(), start.getMonth(), 1);
        const last = new Date(end.getFullYear(), end.getMonth(), 1);

        while (current <= last) {
            const key = current.toLocaleString('default', { month: 'short', year: '2-digit' }); // "Jan 24"
            const sortKey = current.toISOString().slice(0, 7); // "2024-01"
            keys.push({ key, sortKey });
            current.setMonth(current.getMonth() + 1);
        }
        return keys;
    };

    // 2. Calculate Linear Budget Distribution
    filteredProjects.forEach(project => {
        if (!project.startDate || !project.endDate || !project.hoursBudget) return;

        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        const budget = project.hoursBudget;

        // Calculate total months duration (inclusive)
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
        if (months <= 0) return;

        const monthlyAllocation = budget / months;
        const keys = getMonthKeys(start, end);

        keys.forEach(({ key, sortKey }) => {
            if (!monthlyDataMap[key]) {
                monthlyDataMap[key] = { month: key, actual: 0, budget: 0, sortKey };
            }
            monthlyDataMap[key].budget += monthlyAllocation;
        });
    });

    // 3. Add Actuals
    filteredLogs.forEach(log => {
        const date = new Date(log.date);
        const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        const sortKey = date.toISOString().slice(0, 7);

        if (!monthlyDataMap[key]) {
            monthlyDataMap[key] = { month: key, actual: 0, budget: 0, sortKey };
        }
        monthlyDataMap[key].actual += log.hours;
    });

    // 4. Sort Chronologically
    const chartData = Object.values(monthlyDataMap).sort((a, b) =>
        a.sortKey.localeCompare(b.sortKey)
    );

    // Project Variance Data
    const projectVariance = filteredProjects.map(project => {
        const projectLogs = timeLogs.filter(l => l.projectId === project.id && l.status === 'approved');
        const used = projectLogs.reduce((sum, l) => sum + l.hours, 0);
        const budget = project.hoursBudget || 0;
        const variance = budget - used; // Positive means under budget (good), negative means over (bad)

        return {
            name: project.name,
            budget,
            used,
            variance,
            status: variance >= 0 ? 'Under' : 'Over'
        };
    }).sort((a, b) => a.variance - b.variance); // Sort by variance (most over budget first)

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <p className="text-muted-foreground">Loading budget data...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Hours Budget</h1>
                        <p className="text-muted-foreground">
                            Track hours allocation and burn rate across projects.
                        </p>
                    </div>
                </div>

                {/* Unified Filter Bar */}
                <FilterBar />

                {/* Budget Overview Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours Budget</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHoursBudget.toLocaleString()} hrs</div>
                            <p className="text-xs text-muted-foreground">
                                Total allocated hours
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hours Used</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHoursUsed.toLocaleString()} hrs</div>
                            <p className="text-xs text-muted-foreground">
                                {percentUsed}% of budget consumed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hours Remaining</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${hoursRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {hoursRemaining.toLocaleString()} hrs
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {hoursRemaining >= 0 ? 'Hours available' : 'Hours over budget'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Hours Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Hours Burn</CardTitle>
                        <CardDescription>
                            Actual hours logged per month
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => [`${Math.round(value)} hrs`, 'Hours']} />
                                <Legend />
                                <Bar dataKey="actual" fill="#3b82f6" name="Actual Hours" radius={[4, 4, 0, 0]} barSize={40} />
                                <Line type="monotone" dataKey="budget" stroke="#f59e0b" name="Budget Trend" strokeWidth={3} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Project Variance Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Variance (Hours)</CardTitle>
                        <CardDescription>
                            Budget vs Actual hours by project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead className="text-right">Budget (Hrs)</TableHead>
                                    <TableHead className="text-right">Used (Hrs)</TableHead>
                                    <TableHead className="text-right">Variance</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projectVariance.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell className="font-medium">{row.name}</TableCell>
                                        <TableCell className="text-right">{row.budget.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{row.used.toLocaleString()}</TableCell>
                                        <TableCell className={`text-right font-medium ${row.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {Math.abs(row.variance).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {row.variance < 0 ? (
                                                <div className="flex items-center justify-end gap-1 text-red-600">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Over
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1 text-green-600">
                                                    <TrendingDown className="h-4 w-4" />
                                                    Under
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {projectVariance.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No projects found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div >
        </DashboardLayout >
    );
}
