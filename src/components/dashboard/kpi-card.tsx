import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: string;
    trendUp?: boolean;
}

export function KPICard({ title, value, icon: Icon, description, trend, trendUp }: KPICardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={trendUp ? "text-green-500" : "text-red-500"}>
                                {trend}
                            </span>
                        )}
                        {trend && description && " "}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
