"use client"

import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { Project, projectStorage } from "@/lib/project-storage";
import { customerStorage } from "@/lib/customer-storage";
import { ProjectDialog } from "./project-dialog";

export function ProjectList() {
    const [projects, setProjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [projectsData, customersData] = await Promise.all([
                    projectStorage.getProjects(),
                    customerStorage.getCustomers()
                ]);

                const enrichedProjects = projectsData.map(p => ({
                    ...p,
                    customerName: customersData.find(c => c.id === p.customerId)?.name || 'Unknown'
                }));

                setProjects(enrichedProjects);
                setError(null);
            } catch (err) {
                console.error("Failed to load projects:", err);
                setError("Failed to load projects. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [refreshTrigger]);

    if (loading) return <div>Loading projects...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this project?")) {
            await projectStorage.deleteProject(id);
            setRefreshTrigger(prev => prev + 1);
        }
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedProject(null);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setSelectedProject(null);
        }
    };

    const handleProjectSaved = () => {
        setRefreshTrigger(prev => prev + 1);
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No projects found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProjects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">{project.name}</TableCell>
                                    <TableCell>{project.customerName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{project.projectType}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${project.budget.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(project)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(project.id)}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ProjectDialog
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                project={selectedProject}
                onSaved={handleProjectSaved}
            />
        </div>
    );
}
