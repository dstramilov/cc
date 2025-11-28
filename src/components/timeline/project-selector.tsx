"use client"

import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface Project {
    id: string;
    name: string;
    status: 'active' | 'completed' | 'on-hold';
    startDate: string;
    endDate: string;
}

interface ProjectSelectorProps {
    projects: Project[];
    selectedProjectId: string;
    onProjectChange: (projectId: string) => void;
}

export function ProjectSelector({ projects, selectedProjectId, onProjectChange }: ProjectSelectorProps) {
    const selectedProject = projects.find(p => p.id === selectedProjectId);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project:
            </label>
            <Select value={selectedProjectId} onValueChange={onProjectChange}>
                <SelectTrigger className="w-full sm:w-[350px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                    <SelectValue>
                        {selectedProject && (
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${selectedProject.status === 'active' ? 'bg-green-500' :
                                        selectedProject.status === 'completed' ? 'bg-blue-500' :
                                            'bg-yellow-500'
                                    }`} />
                                <span className="font-medium">{selectedProject.name}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(selectedProject.startDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    {projects.map((project) => (
                        <SelectItem
                            key={project.id}
                            value={project.id}
                            className="cursor-pointer"
                        >
                            <div className="flex items-center gap-3 py-1">
                                <div className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-green-500' :
                                        project.status === 'completed' ? 'bg-blue-500' :
                                            'bg-yellow-500'
                                    }`} />
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{project.name}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
