'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Expense {
  id: number;
  title: string;
  amount: string;
  category: string;
  description?: string;
  date: string;
}

export function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Function to load expenses from localStorage
  const loadExpenses = () => {
    try {
      const storedExpenses = localStorage.getItem('expenses');
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setIsLoading(false);
    }
  };

  // Load expenses on component mount
  useEffect(() => {
    loadExpenses();
  }, []);

  // Handle expense deletion
  const handleDeleteExpense = (id: number) => {
    try {
      // Remove the expense from the list
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      
      // Update localStorage
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
      // Update state
      setExpenses(updatedExpenses);

      // Show success toast
      toast({
        title: "Expense Deleted",
        description: "The expense has been successfully removed",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((total, expense) => 
    total + parseFloat(expense.amount), 0);

  if (isLoading) {
    return <div>Loading expenses...</div>;
  }

  return (
    <div className="bg-card rounded-lg border shadow-md p-6 dark:bg-card/90 dark:border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 -z-10" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/80 bg-clip-text text-transparent">Expenses List</h2>
        <div className="text-lg font-semibold px-4 py-1 bg-primary/10 rounded-full">
          Total: <span className="text-primary">₹{totalExpenses.toFixed(2)}</span>
        </div>
      </div>
      
      {expenses.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground/50">
            <path d="M21 8v13H3V8"/>
            <path d="M1 3h22v5H1z"/>
            <path d="M10 12h4"/>
          </svg>
          <p className="text-muted-foreground/70">No expenses found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground/90">{expense.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/90">{expense.category}</span>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>₹{parseFloat(expense.amount).toFixed(2)}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedExpense(expense)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Expense Details Dialog */}
      {selectedExpense && (
        <Dialog 
          open={!!selectedExpense} 
          onOpenChange={() => setSelectedExpense(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Expense Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <strong>Title:</strong> {selectedExpense.title}
              </div>
              <div>
                <strong>Amount:</strong> ₹{parseFloat(selectedExpense.amount).toFixed(2)}
              </div>
              <div>
                <strong>Category:</strong> {selectedExpense.category}
              </div>
              <div>
                <strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString()}
              </div>
              {selectedExpense.description && (
                <div>
                  <strong>Description:</strong> {selectedExpense.description}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 