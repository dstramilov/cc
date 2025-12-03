import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: string;
    trendUp?: boolean;
    loading?: boolean;
}

export const KPICard = React.memo(function KPICard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendUp,
    loading
}: KPICardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        {(description || trend) && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {trend && <span className={trendUp ? "text-green-600" : "text-red-600"}>{trend} </span>}
                                {description}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
});
