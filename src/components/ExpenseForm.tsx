'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const EXPENSE_CATEGORIES = [
  'Food', 
  'Transportation', 
  'Housing', 
  'Utilities', 
  'Entertainment', 
  'Shopping', 
  'Miscellaneous'
];

export function ExpenseForm({ onExpenseAdded }: { onExpenseAdded?: () => void }) {
  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString()
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!expense.title || !expense.amount || !expense.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Retrieve existing expenses from localStorage
      const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      
      // Create new expense with a unique ID
      const newExpense = {
        ...expense,
        id: Date.now(), // Use timestamp as a unique identifier
        amount: parseFloat(expense.amount).toFixed(2)
      };

      // Add new expense to the list
      const updatedExpenses = [...existingExpenses, newExpense];
      
      // Save to localStorage
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));

      // Show success toast
      toast({
        title: "Expense Added",
        description: "Your expense has been successfully recorded",
      });

      // Reset form
      setExpense({
        title: '',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString()
      });

      // Trigger callback if provided (for list refresh)
      onExpenseAdded && onExpenseAdded();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: "Failed to save expense",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg border shadow-md dark:bg-card/90 dark:border-border/50">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 rounded-lg -z-10" />
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent">Add New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-sm font-semibold text-foreground/90">Expense Title</Label>
          <Input 
            id="title"
            value={expense.title}
            onChange={(e) => setExpense({...expense, title: e.target.value})}
            placeholder="Enter expense title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="amount" className="text-sm font-semibold text-foreground/90">Amount (₹)</Label>
          <Input 
            id="amount"
            type="number"
            step="0.01"
            value={expense.amount}
            onChange={(e) => setExpense({...expense, amount: e.target.value})}
            placeholder="Enter amount in ₹"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category" className="text-sm font-semibold text-foreground/90">Category</Label>
          <Select 
            value={expense.category}
            onValueChange={(value) => setExpense({...expense, category: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="description" className="text-sm font-semibold text-foreground/90">Description (Optional)</Label>
          <Input 
            id="description"
            value={expense.description}
            onChange={(e) => setExpense({...expense, description: e.target.value})}
            placeholder="Enter description"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30"
        >
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-circle">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8"/>
              <path d="M12 8v8"/>
            </svg>
            Add Expense
          </span>
        </Button>
      </form>
    </div>
  );
}