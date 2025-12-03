"use client"

import React from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Helper to get week ending date (Friday) for a given week number
const getWeekEndingDate = (weekNumber: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Get to Sunday
    startOfWeek.setDate(startOfWeek.getDate() - (5 - weekNumber) * 7); // Go back to the target week
    const friday = new Date(startOfWeek);
    friday.setDate(startOfWeek.getDate() + 5); // Friday is 5 days after Sunday
    return friday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const data = [
    {
        week: "Week 1",
        date: getWeekEndingDate(1),
        ideal: 100,
        actual: 100,
    },
    {
        week: "Week 2",
        date: getWeekEndingDate(2),
        ideal: 90,
        actual: 92,
    },
    {
        week: "Week 3",
        date: getWeekEndingDate(3),
        ideal: 80,
        actual: 85,
    },
    {
        week: "Week 4",
        date: getWeekEndingDate(4),
        ideal: 70,
        actual: 65,
    },
    {
        week: "Week 5",
        date: getWeekEndingDate(5),
        ideal: 60,
        actual: 50,
    },
]

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            week: string;
            date: string;
        };
        color: string;
        name: string;
        value: number;
    }>;
    label?: string;
}

// Custom tooltip to show week and date
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-background border border-border p-2 rounded-lg shadow-lg">
                <p className="font-medium">{dataPoint.week}</p>
                <p className="text-xs text-muted-foreground mb-2">{dataPoint.date}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {entry.name === 'ideal' ? 'Ideal Burn' : 'Actual Remaining'}: {entry.value}%
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface BurnChartProps {
    loading?: boolean;
}

export const BurnChart = React.memo(function BurnChart({ loading }: BurnChartProps) {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Burn Down Chart</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                {loading ? (
                    <div className="h-[350px] w-full p-4 space-y-4">
                        <Skeleton className="h-[250px] w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <XAxis
                                dataKey="week"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="ideal" stroke="#888888" strokeWidth={2} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="actual" stroke="#adfa1d" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
});
