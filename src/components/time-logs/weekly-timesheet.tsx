"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/lib/project-storage";
import { format, startOfWeek, addDays, endOfWeek } from "date-fns";
import { Save, ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyTimesheetProps {
    projects: Project[];
    selectedProjectIds: string[];
    onSave: (entries: any[]) => void;
    onCancel: () => void;
}

export function WeeklyTimesheet({ projects, selectedProjectIds, onSave, onCancel }: WeeklyTimesheetProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [entries, setEntries] = useState<Record<string, Record<string, number>>>({});

    // Get start of week (Monday)
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Filter projects based on selection
    const activeProjects = projects.filter(p => selectedProjectIds.includes(p.id));

    const handleHoursChange = (projectId: string, dateStr: string, value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) && value !== "") return;

        setEntries(prev => ({
            ...prev,
            [projectId]: {
                ...prev[projectId],
                [dateStr]: value === "" ? 0 : numValue
            }
        }));
    };

    const getHours = (projectId: string, dateStr: string) => {
        return entries[projectId]?.[dateStr] || "";
    };

    const getProjectTotal = (projectId: string) => {
        const projectEntries = entries[projectId] || {};
        return Object.values(projectEntries).reduce((sum, val) => sum + (val || 0), 0);
    };

    const getDayTotal = (dateStr: string) => {
        return activeProjects.reduce((sum, project) => {
            return sum + (entries[project.id]?.[dateStr] || 0);
        }, 0);
    };

    const getWeekTotal = () => {
        return activeProjects.reduce((sum, project) => sum + getProjectTotal(project.id), 0);
    };

    const handleSave = () => {
        // Convert grid to flat entries
        const flatEntries = [];
        for (const projectId of Object.keys(entries)) {
            for (const dateStr of Object.keys(entries[projectId])) {
                const hours = entries[projectId][dateStr];
                if (hours > 0) {
                    flatEntries.push({
                        projectId,
                        date: dateStr,
                        hours
                    });
                }
            }
        }
        onSave(flatEntries);
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => addDays(prev, direction === 'prev' ? -7 : 7));
    };

    return (
        <Card className="w-full border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                        <CardTitle className="text-lg">
                            Week of {format(weekStart, "MMM d, yyyy")}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            to {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
                        </p>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Timesheet
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <div className="grid grid-cols-[2fr,repeat(7,1fr),1fr] gap-0">
                        {/* Header Row */}
                        <div className="p-3 font-medium border-b bg-muted/50">Project</div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="p-3 text-center font-medium border-b border-l bg-muted/50">
                                <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                                <div>{format(day, "d")}</div>
                            </div>
                        ))}
                        <div className="p-3 text-center font-medium border-b border-l bg-muted/50">Total</div>

                        {/* Project Rows */}
                        {activeProjects.map(project => (
                            <React.Fragment key={project.id}>
                                <div className="p-3 border-b flex flex-col justify-center">
                                    <span className="font-medium text-sm truncate" title={project.name}>{project.name}</span>
                                    <span className="text-xs text-muted-foreground truncate">{(project as any).customerName}</span>
                                </div>
                                {weekDays.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    return (
                                        <div key={dateStr} className="p-1 border-b border-l">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                className="h-full w-full text-center border-none focus-visible:ring-1"
                                                value={getHours(project.id, dateStr)}
                                                onChange={(e) => handleHoursChange(project.id, dateStr, e.target.value)}
                                            />
                                        </div>
                                    );
                                })}
                                <div className="p-3 text-center font-bold border-b border-l flex items-center justify-center bg-muted/20">
                                    {getProjectTotal(project.id).toFixed(1)}
                                </div>
                            </React.Fragment>
                        ))}

                        {/* Total Row */}
                        <div className="p-3 font-bold bg-muted/50">Daily Total</div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="p-3 text-center font-bold border-l bg-muted/50">
                                {getDayTotal(format(day, 'yyyy-MM-dd')).toFixed(1)}
                            </div>
                        ))}
                        <div className="p-3 text-center font-bold border-l bg-muted/50 text-blue-600">
                            {getWeekTotal().toFixed(1)}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
