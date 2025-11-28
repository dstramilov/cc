import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const milestones = [
    {
        phase: "Discovery & Planning",
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

export function ProjectTimeline() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {milestones.map((milestone, index) => (
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
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
