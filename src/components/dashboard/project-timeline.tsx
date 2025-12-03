"use client"

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const milestones = [
    {
        phase: "Discovery",
        status: "Completed",
        date: "Oct 1 - Oct 15",
        progress: 100,
    },
    {
        phase: "Design",
        status: "In Progress",
        date: "Oct 16 - Oct 30",
        progress: 60,
    },
    {
        phase: "Development",
        status: "Pending",
        date: "Nov 1 - Nov 30",
        progress: 0,
    },
    {
        phase: "Testing & QA",
        status: "Pending",
        date: "Dec 1 - Dec 15",
        progress: 0,
    },
    {
        phase: "Launch",
        status: "Pending",
        date: "Dec 20",
        progress: 0,
    },
];

interface ProjectTimelineProps {
    loading?: boolean;
}

export const ProjectTimeline = React.memo(function ProjectTimeline({ loading }: ProjectTimelineProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {loading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center">
                                <div className="w-32">
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="ml-4 flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            </div>
                        ))
                    ) : (
                        milestones.map((milestone, index) => (
                            <div key={index} className="flex items-center">
                                <div className="w-32 text-sm font-medium text-muted-foreground">
                                    {milestone.date}
                                </div>
                                <div className="ml-4 flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{milestone.phase}</span>
                                        <Badge variant={milestone.status === "Completed" ? "secondary" : milestone.status === "In Progress" ? "default" : "outline"}>
                                            {milestone.status}
                                        </Badge>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-2 rounded-full bg-primary transition-all"
                                            style={{ width: `${milestone.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
