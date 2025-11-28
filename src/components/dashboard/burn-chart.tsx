"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

// Custom tooltip to show week and date
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-background border rounded-lg p-3 shadow-lg">
                <p className="font-semibold text-sm">{dataPoint.week}</p>
                <p className="text-xs text-muted-foreground mb-2">Week ending {dataPoint.date}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}%
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function BurnChart() {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Burn Down Chart</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
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
            </CardContent>
        </Card>
    )
}
