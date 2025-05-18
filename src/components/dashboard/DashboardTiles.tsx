'use client';

import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Wallet, 
  BarChart, 
  ShoppingCart, 
  FileText 
} from 'lucide-react';

// Existing imports and other tiles...

export function ExpenseTile() {
  return (
    <Link href="/expenses">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Expense Tracker
          </CardTitle>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Track Expenses</div>
          <p className="text-xs text-muted-foreground">
            Manage and analyze your spending
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

// In your main dashboard component, add this tile to the grid
export function DashboardTiles() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Other existing tiles */}
      <ExpenseTile />
    </div>
  );
} 