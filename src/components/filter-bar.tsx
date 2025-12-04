"use client"

import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useFilter } from "@/context/filter-context";
import { customerStorage, Customer } from "@/lib/customer-storage";
import { projectStorage, Project } from "@/lib/project-storage";
import { useUser } from "@/lib/user-context";

export function FilterBar() {
    const {
        selectedCustomerId,
        setSelectedCustomerId,
        selectedProjectIds,
        setSelectedProjectIds,
    } = useFilter();

    const { role, user } = useUser();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [openCustomer, setOpenCustomer] = useState(false);
    const [openProject, setOpenProject] = useState(false);

    // Check if user is a customer (filters should be disabled)
    const isCustomerRole = role === 'customer';

    useEffect(() => {
        const loadData = async () => {
            const customersData = await customerStorage.getCustomers();
            setCustomers(customersData);

            const projectsData = await projectStorage.getProjects();
            setProjects(projectsData);
        };
        loadData();
    }, []);

    // Auto-filter customer role users to their own customer
    useEffect(() => {
        if (isCustomerRole && user?.customerId && selectedCustomerId !== user.customerId) {
            setSelectedCustomerId(user.customerId);
        }
    }, [isCustomerRole, user, selectedCustomerId, setSelectedCustomerId]);

    // Filter projects based on selected customer
    const availableProjects = selectedCustomerId
        ? projects.filter((p) => p.customerId === selectedCustomerId)
        : projects;

    const handleSelectAllProjects = () => {
        setSelectedProjectIds(availableProjects.map((p) => p.id));
    };

    const handleDeselectAllProjects = () => {
        setSelectedProjectIds([]);
    };

    const selectedCustomerName = customers.find((c) => c.id === selectedCustomerId)?.name;

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Customer Selector */}
            <div className="flex-1 max-w-sm">
                <label className="text-sm font-medium mb-1.5 block">Customer</label>
                <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCustomer}
                            className="w-full justify-between"
                            disabled={isCustomerRole}
                        >
                            {selectedCustomerName || "Select customer..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                        <Command>
                            <CommandInput placeholder="Search customer..." />
                            <CommandList>
                                <CommandEmpty>No customer found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        value="all"
                                        onSelect={() => {
                                            setSelectedCustomerId("");
                                            setOpenCustomer(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCustomerId === "" ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        All Customers
                                    </CommandItem>
                                    {customers.map((customer) => (
                                        <CommandItem
                                            key={customer.id}
                                            value={customer.name}
                                            onSelect={() => {
                                                setSelectedCustomerId(customer.id);
                                                setOpenCustomer(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedCustomerId === customer.id
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {customer.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Project Selector (Multi-select) */}
            <div className="flex-1 max-w-sm">
                <label className="text-sm font-medium mb-1.5 block">Projects</label>
                <Popover open={openProject} onOpenChange={setOpenProject}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openProject}
                            className="w-full justify-between"
                        >
                            <div className="flex gap-1 flex-wrap">
                                {selectedProjectIds.length === 0 && "Select projects..."}
                                {selectedProjectIds.length > 0 && selectedProjectIds.length < 3 && (
                                    availableProjects
                                        .filter((p) => selectedProjectIds.includes(p.id))
                                        .map((p) => (
                                            <Badge variant="secondary" key={p.id} className="mr-1">
                                                {p.name}
                                            </Badge>
                                        ))
                                )}
                                {selectedProjectIds.length >= 3 && (
                                    <Badge variant="secondary">
                                        {selectedProjectIds.length} selected
                                    </Badge>
                                )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search projects..." />
                            <CommandList>
                                <CommandEmpty>No project found.</CommandEmpty>
                                <div className="p-2 border-b flex gap-2">
                                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={handleSelectAllProjects}>
                                        Select All
                                    </Button>
                                    <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs" onClick={handleDeselectAllProjects}>
                                        Deselect All
                                    </Button>
                                </div>
                                <CommandGroup className="max-h-[300px] overflow-auto">
                                    {availableProjects.map((project) => (
                                        <CommandItem
                                            key={project.id}
                                            value={project.name}
                                            onSelect={() => {
                                                setSelectedProjectIds(
                                                    selectedProjectIds.includes(project.id)
                                                        ? selectedProjectIds.filter((id) => id !== project.id)
                                                        : [...selectedProjectIds, project.id]
                                                );
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    selectedProjectIds.includes(project.id)
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            <span>{project.name}</span>
                                            <span className="ml-2 text-muted-foreground text-xs">
                                                ({project.projectType})
                                            </span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
