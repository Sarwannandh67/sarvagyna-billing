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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Expenses List</h2>
        <div className="text-lg font-semibold">
          Total: ${totalExpenses.toFixed(2)}
        </div>
      </div>
      
      {expenses.length === 0 ? (
        <p className="text-center text-gray-500">No expenses found</p>
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
                <TableCell>{expense.title}</TableCell>
                <TableCell>${parseFloat(expense.amount).toFixed(2)}</TableCell>
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
            <div className="space-y-4">
              <div>
                <strong>Title:</strong> {selectedExpense.title}
              </div>
              <div>
                <strong>Amount:</strong> ${parseFloat(selectedExpense.amount).toFixed(2)}
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