
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// Placeholder monthly revenue data removed.
// This data would typically come from an API or state management.
const chartData: any[] = [
  // Example structure, real data would be dynamic
  // { month: "January", revenue: 0, expenses: 0 },
  // { month: "February", revenue: 0, expenses: 0 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function MonthlyRevenueChart() {
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
        <TrendingUp className="h-12 w-12 mb-4" />
        <p>No revenue data available to display chart.</p>
        <p className="text-xs">Data will appear here once invoices are processed.</p>
      </div>
    );
  }
  
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
          />
          <Legend />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
