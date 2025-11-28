"use client"

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/lib/user-context";
import { UserCircle, Mail, Briefcase, Calendar } from "lucide-react";

export default function ProfilePage() {
    const { role } = useUser();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">User Profile</h3>
                    <p className="text-sm text-muted-foreground">
                        View and manage your profile information.
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Profile Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                                    JD
                                </div>
                                <div>
                                    <CardTitle>John Doe</CardTitle>
                                    <CardDescription className="capitalize">{role} Account</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Your basic profile details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="flex gap-2">
                                    <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                                    <Input id="email" type="email" defaultValue="john@example.com" className="flex-1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <div className="flex gap-2">
                                    <Briefcase className="h-4 w-4 mt-3 text-muted-foreground" />
                                    <Input id="role" defaultValue={role} className="flex-1 capitalize" disabled />
                                </div>
                            </div>
                            <Separator />
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                Details about your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Member Since</span>
                                </div>
                                <span className="text-sm text-muted-foreground">January 2024</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Account Status</span>
                                </div>
                                <span className="text-sm text-green-600 font-medium">Active</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
