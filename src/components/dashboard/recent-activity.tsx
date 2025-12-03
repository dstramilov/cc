import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, activityStorage } from "@/lib/activity-storage";
import { useUser } from "@/lib/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, FileText, CheckSquare, PlusCircle, Activity as ActivityIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const RecentActivity = React.memo(function RecentActivity() {
    const { user } = useUser();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const loadActivities = useCallback(async () => {
        if (!user?.customerId) return;
        try {
            const data = await activityStorage.getActivities(user.customerId);
            setActivities(data);
        } catch (error) {
            console.error('Failed to load activities:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.customerId]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    const getActivityIcon = useCallback((type: string) => {
        switch (type) {
            case 'time_logged':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'document_uploaded':
                return <FileText className="h-4 w-4 text-orange-500" />;
            case 'todo_created':
            case 'todo_completed':
                return <CheckSquare className="h-4 w-4 text-green-500" />;
            case 'project_created':
                return <PlusCircle className="h-4 w-4 text-purple-500" />;
            default:
                return <ActivityIcon className="h-4 w-4 text-gray-500" />;
        }
    }, []);

    if (!user?.customerId) return null;

    return (
        <Card className="glass-card h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-1">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-1 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No recent activity.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex gap-3 items-start group">
                                <div className="mt-1 bg-secondary p-1.5 rounded-full group-hover:bg-background transition-colors border border-transparent group-hover:border-border">
                                    {getActivityIcon(activity.activity_type)}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium leading-none">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
