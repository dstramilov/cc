"use client"

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PieChart, Clock, Calendar, Settings, LogOut, UserCircle, Menu, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser, UserRole } from "@/lib/user-context";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const sidebarLinks = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/budget", label: "Budget", icon: PieChart },
    { href: "/time-logs", label: "Time Logs", icon: Clock },
    { href: "/meeting-notes", label: "Meeting Notes", icon: FileText },
    { href: "/timeline", label: "Timeline", icon: Calendar },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { role, setRole, isProxied, exitProxy, user } = useUser();
    const [isCollapsed, setIsCollapsed] = React.useState(true);

    return (
        <div className="flex min-h-screen flex-col">
            {isProxied && (
                <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between text-sm font-medium z-50 fixed w-full top-0">
                    <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        <span>
                            Viewing as <strong>{user?.name}</strong> ({role})
                        </span>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={exitProxy}
                        className="h-7 text-xs bg-white text-purple-600 hover:bg-purple-50 border-none"
                    >
                        Exit Proxy
                    </Button>
                </div>
            )}
            <div className={`flex flex-1 ${isProxied ? 'mt-[40px]' : ''}`}>
                {/* Sidebar - Hidden on mobile, visible on desktop */}
                <aside
                    className={cn(
                        "hidden flex-col border-r border-white/20 dark:border-white/10 md:flex fixed h-full z-10 glass transition-all duration-300 ease-in-out",
                        isProxied ? 'top-[40px] h-[calc(100%-40px)]' : 'top-0',
                        isCollapsed ? "w-16" : "w-64"
                    )}
                >
                    <div className={cn("flex items-center p-4", isCollapsed ? "justify-center" : "justify-between")}>
                        {!isCollapsed && (
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                                Customer Central
                            </h1>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="h-8 w-8"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    </div>
                    <Separator />
                    <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                        {sidebarLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover-lift",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                    title={isCollapsed ? link.label : undefined}
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {!isCollapsed && <span>{link.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        {/* Role Switcher for Demo */}
                        {!isCollapsed && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Simulate Role
                                </label>
                                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                                    <SelectTrigger className="w-full h-8 text-xs bg-white dark:bg-gray-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin (Full Access)</SelectItem>
                                        <SelectItem value="pm">PM (Full Access)</SelectItem>
                                        <SelectItem value="customer">Customer (Read Only)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Link
                            href="/profile"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors",
                                isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? "Profile" : undefined}
                        >
                            <UserCircle className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="truncate font-semibold">John Doe</p>
                                    <p className="truncate text-xs text-gray-500 capitalize">{role}</p>
                                </div>
                            )}
                        </Link>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
                                isCollapsed ? "justify-center px-2" : "justify-start"
                            )}
                            title={isCollapsed ? "Logout" : undefined}
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            {!isCollapsed && "Logout"}
                        </Button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main
                    className={cn(
                        "flex-1 flex flex-col transition-all duration-300 ease-in-out",
                        isCollapsed ? "md:ml-16" : "md:ml-64"
                    )}
                >
                    {/* Mobile Header */}
                    <header className="md:hidden flex items-center justify-between p-4 border-b">
                        <h1 className="text-xl font-bold">Customer Central</h1>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </header>

                    {/* Page Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
