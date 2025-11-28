"use client"

import React, { useState } from "react";
import { Plus, Clock, FileText, FolderPlus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuickActionsProps {
    onLogTime?: () => void;
    onAddNote?: () => void;
    onCreateProject?: () => void;
    onUploadDocument?: () => void;
}

export function QuickActions({
    onLogTime,
    onAddNote,
    onCreateProject,
    onUploadDocument
}: QuickActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Quick Actions
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogTime} className="cursor-pointer">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Log Time</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAddNote} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Add Meeting Note</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreateProject} className="cursor-pointer">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    <span>Create Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onUploadDocument} className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload Document</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
