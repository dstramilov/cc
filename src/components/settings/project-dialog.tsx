"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Project, projectStorage } from "@/lib/project-storage";
import { Customer, customerStorage } from "@/lib/customer-storage";

interface ProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project | null;
    onSaved: () => void;
}

export function ProjectDialog({ open, onOpenChange, project, onSaved }: ProjectDialogProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Project>>({
        name: "",
        customerId: "",
        projectType: "Implementation",
        status: "active",
        budget: 0,
        hoursBudget: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        description: ""
    });

    useEffect(() => {
        const loadCustomers = async () => {
            const data = await customerStorage.getCustomers();
            setCustomers(data);
        };
        loadCustomers();
    }, []);

    useEffect(() => {
        if (project) {
            setFormData({
                ...project,
                startDate: project.startDate.split('T')[0],
                endDate: project.endDate ? project.endDate.split('T')[0] : ""
            });
        } else {
            setFormData({
                name: "",
                customerId: "",
                projectType: "Implementation",
                status: "active",
                budget: 0,
                hoursBudget: 0,
                startDate: new Date().toISOString().split('T')[0],
                endDate: "",
                description: ""
            });
        }
    }, [project, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (project) {
                await projectStorage.saveProject({ ...formData, id: project.id });
            } else {
                await projectStorage.saveProject(formData);
            }
            onSaved();
        } catch (error) {
            console.error("Failed to save project:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
                        <DialogDescription>
                            {project ? "Update project details." : "Create a new project."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer" className="text-right">
                                Customer
                            </Label>
                            <Select
                                value={formData.customerId}
                                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                                required
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select
                                value={formData.projectType}
                                onValueChange={(value) => setFormData({ ...formData, projectType: value as any })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Implementation">Implementation</SelectItem>
                                    <SelectItem value="Optimization">Optimization</SelectItem>
                                    <SelectItem value="Support">Support</SelectItem>
                                    <SelectItem value="Custom Dev">Custom Dev</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="on-hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="budget" className="text-right">
                                $ Budget
                            </Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                className="col-span-3"
                                min="0"
                                placeholder="Dollar budget"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="hoursBudget" className="text-right">
                                Hours Budget
                            </Label>
                            <Input
                                id="hoursBudget"
                                type="number"
                                value={formData.hoursBudget || 0}
                                onChange={(e) => setFormData({ ...formData, hoursBudget: Number(e.target.value) })}
                                className="col-span-3"
                                min="0"
                                placeholder="Hours budget"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="startDate" className="text-right">
                                Start Date
                            </Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="endDate" className="text-right">
                                End Date
                            </Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
