
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/invoice-utils"

interface MonthlyTransactionChartProps {
  data: Array<{ month: string; totalAmount: number }>;
  currency: string;
}

const chartConfig = {
  totalAmount: {
    label: "Total Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function MonthlyTransactionsChart({ data, currency }: MonthlyTransactionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
        <TrendingUp className="h-12 w-12 mb-4" />
        <p>No transaction data available to display chart.</p>
        <p className="text-xs">Data will appear here once transactions are recorded.</p>
      </div>
    );
  }
  
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
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
            tickFormatter={(value) => formatCurrency(value, currency).replace(/\.00$/, '')} // Simplify for axis
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent 
                        indicator="dashed" 
                        formatter={(value) => formatCurrency(Number(value), currency)} 
                      />}
          />
          <Legend />
          <Bar dataKey="totalAmount" fill="var(--color-totalAmount)" radius={4} name="Total Amount" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

