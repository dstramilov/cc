"use client"

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Users, Building2, FolderKanban, Plus, Database } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { useUIPreferences } from "@/context/ui-preferences-context";
import { ProjectList } from "@/components/settings/project-list";
import { UserList } from "@/components/settings/user-list";
import { CustomerList } from "@/components/settings/customer-list";
import { loadTestData } from "@/lib/load-test-data";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";

export default function SettingsPage() {
    const { role } = useUser();
    const { showInternalIds, setShowInternalIds } = useUIPreferences();
    const isAdmin = role === 'admin';
    const isPm = role === 'pm';
    const canManageProjects = isAdmin || isPm;

    const [activeTab, setActiveTab] = React.useState("general");
    const [showAddProject, setShowAddProject] = React.useState(false);
    const [projectRefresh, setProjectRefresh] = React.useState(0);

    const handleLoadTestData = async () => {
        if (confirm("This will clear all existing data and generate 40 sample projects. Continue?")) {
            await loadTestData();
            window.location.reload();
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Settings</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "general" ? "bg-background text-foreground shadow" : ""}`}
                        >
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            General
                        </button>
                        {canManageProjects && (
                            <button
                                onClick={() => setActiveTab("projects")}
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "projects" ? "bg-background text-foreground shadow" : ""}`}
                            >
                                <FolderKanban className="mr-2 h-4 w-4" />
                                Projects
                            </button>
                        )}
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setActiveTab("customers")}
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "customers" ? "bg-background text-foreground shadow" : ""}`}
                                >
                                    <Building2 className="mr-2 h-4 w-4" />
                                    Customers
                                </button>
                                <button
                                    onClick={() => setActiveTab("users")}
                                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "users" ? "bg-background text-foreground shadow" : ""}`}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    Users
                                </button>
                            </>
                        )}
                    </div>

                    {activeTab === "general" && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>
                                        Customize how the application looks and behaves.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="show-ids" className="flex flex-col space-y-1">
                                            <span>Show Internal IDs</span>
                                            <span className="font-normal text-xs text-muted-foreground">
                                                Display internal database IDs for debugging purposes.
                                            </span>
                                        </Label>
                                        <Switch
                                            id="show-ids"
                                            checked={showInternalIds}
                                            onCheckedChange={setShowInternalIds}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile</CardTitle>
                                    <CardDescription>
                                        Manage your public profile information.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" defaultValue="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" defaultValue="john@example.com" />
                                    </div>
                                    <Button>Save Changes</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Data Management</CardTitle>
                                    <CardDescription>
                                        Manage test data and projects.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm font-medium">Load Test Data</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Generate 40 sample projects with customers and time logs.
                                                </span>
                                            </div>
                                            <Button variant="outline" onClick={handleLoadTestData}>
                                                <Database className="h-4 w-4 mr-2" />
                                                Load Test Data
                                            </Button>
                                        </div>
                                        {canManageProjects && (
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <div className="flex flex-col space-y-1">
                                                    <span className="text-sm font-medium">Add Project</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Create a new project in the system.
                                                    </span>
                                                </div>
                                                <Button onClick={() => setShowAddProject(true)}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Project
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {canManageProjects && activeTab === "projects" && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Projects</CardTitle>
                                    <CardDescription>
                                        Manage all projects in the system.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ProjectList />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {isAdmin && activeTab === "customers" && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer Management</CardTitle>
                                    <CardDescription>
                                        Manage customer accounts and access.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CustomerList />
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {isAdmin && activeTab === "users" && (
                        <div className="space-y-4 animate-in fade-in-50">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>User Management</CardTitle>
                                            <CardDescription>
                                                Manage system users and permissions.
                                            </CardDescription>
                                        </div>
                                        {/* Add User button could go here */}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <UserList refreshTrigger={0} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            <AddProjectDialog
                open={showAddProject}
                onOpenChange={setShowAddProject}
                onProjectAdded={() => {
                    setProjectRefresh(prev => prev + 1);
                    setShowAddProject(false);
                }}
            />
        </DashboardLayout>
    );
}
