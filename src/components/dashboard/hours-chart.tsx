"use client"

import React, { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { timeLogStorage } from "@/lib/time-log-storage"

interface MonthlyData {
    name: string;
    hours: number;
}

interface HoursChartProps {
    loading?: boolean;
    filteredProjectIds?: string[];
}

export const HoursChart = React.memo(function HoursChart({ loading, filteredProjectIds = [] }: HoursChartProps) {
    const [chartData, setChartData] = useState<MonthlyData[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const loadChartData = async () => {
            try {
                setDataLoading(true);
                const timeLogs = await timeLogStorage.getTimeLogs();

                // Filter time logs by selected projects if any
                const filteredLogs = filteredProjectIds.length > 0
                    ? timeLogs.filter(log => filteredProjectIds.includes(log.projectId))
                    : timeLogs;

                // Group by month and calculate total hours
                const monthlyMap = new Map<string, number>();

                filteredLogs.forEach(log => {
                    if (log.status !== 'approved') return; // Only count approved logs

                    const date = new Date(log.date);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    const currentHours = monthlyMap.get(monthKey) || 0;
                    monthlyMap.set(monthKey, currentHours + log.hours);
                });

                // Convert to array and sort by date (most recent 6 months)
                const sortedData = Array.from(monthlyMap.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .slice(-6) // Last 6 months
                    .map(([key, hours]) => {
                        const [year, month] = key.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1);
                        return {
                            name: date.toLocaleDateString('en-US', { month: 'short' }),
                            hours: Math.round(hours),
                        };
                    });

                setChartData(sortedData.length > 0 ? sortedData : [
                    { name: "No Data", hours: 0 }
                ]);
            } catch (error) {
                console.error("Failed to load hours chart data:", error);
                setChartData([{ name: "Error", hours: 0 }]);
            } finally {
                setDataLoading(false);
            }
        };

        loadChartData();
    }, [filteredProjectIds]);

    const isLoading = loading || dataLoading;

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Hours Usage</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                {isLoading ? (
                    <div className="h-[350px] w-full flex items-end justify-between gap-4 p-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="w-full space-y-2">
                                <Skeleton className="h-[200px] w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="name"
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
                                tickFormatter={(value) => `${value}h`}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="hours" name="Hours" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
});
