'use client';

import { useState } from 'react';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpensesList } from '@/components/ExpensesList';
import { ExpenseAnalytics } from '@/components/ExpenseAnalytics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [key, setKey] = useState(0); // Used to force re-render of components
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
      
      // Force re-render of components
      setKey(prev => prev + 1);
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

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Expenses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <ExpenseForm key={`form-${key}`} onExpenseAdded={() => setKey(prev => prev + 1)} />
            </div>
            <div className="space-y-4">
              <ExpensesList key={`list-${key}`} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ExpenseAnalytics key={`analytics-${key}`} />
        </TabsContent>
      </Tabs>

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