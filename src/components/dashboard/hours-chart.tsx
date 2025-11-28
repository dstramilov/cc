"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    {
        name: "Jan",
        billable: 120,
        nonBillable: 30,
    },
    {
        name: "Feb",
        billable: 150,
        nonBillable: 20,
    },
    {
        name: "Mar",
        billable: 180,
        nonBillable: 40,
    },
    {
        name: "Apr",
        billable: 140,
        nonBillable: 25,
    },
]

export function HoursChart() {
    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Hours Usage</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
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
                        <Legend />
                        <Bar dataKey="billable" name="Billable" stackId="a" fill="#adfa1d" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="nonBillable" name="Non-Billable" stackId="a" fill="#2a2a2a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
