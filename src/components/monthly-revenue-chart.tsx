"use client"

import React, { useState, useMemo } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns"

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
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

// Assume this comes from your bill data source
interface Bill {
  id: string;
  date: string;
  amount: number;
  type: 'revenue' | 'expense';
}

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

export function MonthlyRevenueChart({ bills = [] }: { bills?: Bill[] }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Process bills into monthly aggregates
  const monthlyData = useMemo(() => {
    // If no bills or bills is undefined, return default entry
    if (!bills || bills.length === 0) {
      return [{ month: format(new Date(), 'MMMM'), revenue: 0, expenses: 0 }]
    }

    // If no date range is selected, use all bills
    const filteredBills = dateRange?.from && dateRange?.to 
      ? bills.filter(bill => {
          const billDate = parseISO(bill.date)
          return billDate >= startOfMonth(dateRange.from as Date) && 
                 billDate <= endOfMonth(dateRange.to as Date)
        })
      : bills

    // Group bills by month
    const monthlyAggregates = filteredBills.reduce((acc, bill) => {
      const month = format(parseISO(bill.date), 'MMMM')
      
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, expenses: 0 }
      }

      if (bill.type === 'revenue') {
        acc[month].revenue += bill.amount
      } else {
        acc[month].expenses += bill.amount
      }

      return acc
    }, {} as Record<string, { month: string, revenue: number, expenses: number }>)

    // Convert to array, ensuring at least one entry
    return Object.values(monthlyAggregates).length > 0 
      ? Object.values(monthlyAggregates)
      : [{ month: format(new Date(), 'MMMM'), revenue: 0, expenses: 0 }]
  }, [bills, dateRange])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue Trend</CardTitle>
        <CardDescription>
          <div className="flex items-center space-x-2 mb-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {monthlyData.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground">
            <TrendingUp className="h-12 w-12 mb-4" />
            <p>No revenue data available to display chart.</p>
            <p className="text-xs">Data will appear here once invoices are processed.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
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
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
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
        )}
      </CardContent>
    </Card>
  )
}
