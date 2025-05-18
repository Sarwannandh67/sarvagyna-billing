'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Expense {
  id: number;
  title: string;
  amount: string;
  category: string;
  description?: string;
  date: string;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9E9E9E'];

export function ExpenseAnalytics() {
  // Load expenses from localStorage
  const expenses = useMemo(() => {
    try {
      const storedExpenses = localStorage.getItem('expenses');
      return storedExpenses ? JSON.parse(storedExpenses) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  }, []);

  // Calculate category-wise totals
  const categoryData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc: Record<string, number>, expense: Expense) => {
      if (!expense.category || !expense.amount) return acc;
      const category = expense.category;
      const amount = parseFloat(expense.amount);
      if (isNaN(amount)) return acc;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(entry => {
      const [name, value] = entry as [string, number];
      return ({
      name,
      value: parseFloat(value.toFixed(2))
    });
    });
  }, [expenses]);

  // Calculate monthly totals
  const monthlyData = useMemo(() => {
    const monthlyTotals = expenses.reduce((acc: Record<string, number>, expense: Expense) => {
      if (!expense.date || !expense.amount) return acc;
      const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
      const amount = parseFloat(expense.amount);
      if (isNaN(amount)) return acc;
      acc[month] = (acc[month] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyTotals).map(entry => {
      const [month, amount] = entry as [string, number];
      return ({
      month,
      amount: parseFloat(amount.toFixed(2))
    });
    });
  }, [expenses]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((total: number, expense: Expense) => {
      if (!expense.amount) return total;
      const amount = parseFloat(expense.amount);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [expenses]);

  // Calculate average expense
  const averageExpense = useMemo(() => {
    return expenses.length > 0 ? totalExpenses / expenses.length : 0;
  }, [expenses, totalExpenses]);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {expenses.length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <ul className="grid grid-cols-2 gap-2">
                {categoryData.map((item, index) => (
                  <li key={item.name} className="flex items-center text-sm">
                    <span 
                      className="mr-2 h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {item.name}: ₹{item.value}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="amount" fill="#4ECDC4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
