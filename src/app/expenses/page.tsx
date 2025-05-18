'use client';

import { useState } from 'react';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpensesList } from '@/components/ExpensesList';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

export default function ExpensesPage() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleResetExpenses = () => {
    try {
      // Clear expenses from localStorage
      localStorage.removeItem('expenses');
      
      // Show success toast
      toast({
        title: "Expenses Cleared",
        description: "All expenses have been deleted",
      });

      // Close the dialog
      setIsResetDialogOpen(false);

      // Optionally, you could force a re-render of the ExpensesList
      // by using a state or key prop
    } catch (error) {
      console.error('Error resetting expenses:', error);
      toast({
        title: "Error",
        description: "Failed to clear expenses",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <Button 
          variant="destructive" 
          onClick={() => setIsResetDialogOpen(true)}
        >
          Reset All Expenses
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <ExpenseForm />
        </div>
        <div>
          <ExpensesList />
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog 
        open={isResetDialogOpen} 
        onOpenChange={setIsResetDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Expenses</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all expenses? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleResetExpenses}
            >
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 