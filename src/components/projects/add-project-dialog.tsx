import React, { useEffect, useState } from 'react';
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
import { Project, ProjectType, projectStorage } from "@/lib/project-storage";
import { Customer, customerStorage } from "@/lib/customer-storage";

interface AddProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProjectAdded: () => void;
}

export function AddProjectDialog({ open, onOpenChange, onProjectAdded }: AddProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        customerId: '',
        projectType: 'T&M' as ProjectType,
        budget: '',
        startDate: '',
        endDate: '',
        description: '',
    });

    useEffect(() => {
        const loadCustomers = async () => {
            const data = await customerStorage.getCustomers();
            setCustomers(data.filter(c => c.status === 'active'));
        };
        loadCustomers();
    }, []);

    useEffect(() => {
        if (!open) {
            setFormData({
                name: '',
                customerId: '',
                projectType: 'T&M',
                budget: '',
                startDate: '',
                endDate: '',
                description: '',
            });
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newProject: Project = {
                id: `PROJ-${Date.now()}`,
                name: formData.name,
                customerId: formData.customerId,
                projectType: formData.projectType,
                status: 'active',
                budget: parseFloat(formData.budget) || 0,
                startDate: formData.startDate,
                endDate: formData.endDate,
                description: formData.description,
                createdAt: new Date().toISOString(),
            };

            await projectStorage.saveProject(newProject);
            onProjectAdded();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to add project:', error);
            alert('Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>
                        Create a new project and assign it to a customer.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Project Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                placeholder="Website Redesign"
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
                            <Label htmlFor="projectType" className="text-right">
                                Project Type
                            </Label>
                            <Select
                                value={formData.projectType}
                                onValueChange={(value: ProjectType) => setFormData({ ...formData, projectType: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="T&M">T&M (Time & Materials)</SelectItem>
                                    <SelectItem value="Fixed">Fixed Price</SelectItem>
                                    <SelectItem value="Change Order">Change Order (T&M)</SelectItem>
                                    <SelectItem value="MSP">MSP (Subscription)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="budget" className="text-right">
                                Budget
                            </Label>
                            <Input
                                id="budget"
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                className="col-span-3"
                                placeholder="50000"
                                required
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
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                                placeholder="Optional project description..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
