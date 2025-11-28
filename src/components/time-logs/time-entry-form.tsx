"use client"

import React, { useState } from 'react';
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_PROJECTS } from "@/lib/project-data";

interface TimeEntryFormProps {
    onSave: (entry: any) => void;
    onCancel: () => void;
}

export function TimeEntryForm({ onSave, onCancel }: TimeEntryFormProps) {
    const [projectId, setProjectId] = useState<string>("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [billable, setBillable] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !date) return;

        onSave({
            projectId,
            weekEnding: format(date, "yyyy-MM-dd"),
            billable: parseFloat(billable) || 0,
            total: parseFloat(billable) || 0
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                            {MOCK_PROJECTS.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Week Ending Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="billable">Hours</Label>
                    <Input
                        id="billable"
                        type="number"
                        placeholder="0.0"
                        value={billable}
                        onChange={(e) => setBillable(e.target.value)}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                    disabled={!projectId || !date}
                >
                    Save Time Entry
                </Button>
            </div>
        </form>
    );
}
