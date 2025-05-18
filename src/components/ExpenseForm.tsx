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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Expense Title</Label>
          <Input 
            id="title"
            value={expense.title}
            onChange={(e) => setExpense({...expense, title: e.target.value})}
            placeholder="Enter expense title"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input 
            id="amount"
            type="number"
            step="0.01"
            value={expense.amount}
            onChange={(e) => setExpense({...expense, amount: e.target.value})}
            placeholder="Enter amount"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
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
          <Label htmlFor="description">Description (Optional)</Label>
          <Input 
            id="description"
            value={expense.description}
            onChange={(e) => setExpense({...expense, description: e.target.value})}
            placeholder="Enter description"
          />
        </div>
        
        <Button type="submit" className="w-full">
          Add Expense
        </Button>
      </form>
    </div>
  );
} 