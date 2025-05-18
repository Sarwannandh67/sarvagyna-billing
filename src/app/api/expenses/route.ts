import { NextRequest, NextResponse } from 'next/server';

// Expense interface
interface Expense {
  id?: number;
  title: string;
  amount: number;
  category: string;
  description?: string;
  userId: string;
  date?: Date;
}

// GET all expenses
export async function GET() {
  try {
    // In a real-world scenario, you'd want to implement server-side storage or authentication
    const expensesJson = typeof window !== 'undefined' 
      ? localStorage.getItem('expenses') 
      : null;
    
    const expenses: Expense[] = expensesJson 
      ? JSON.parse(expensesJson) 
      : [];

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' }, 
      { status: 500 }
    );
  }
}

// POST new expense
export async function POST(request: NextRequest) {
  try {
    const expenseData: Expense = await request.json();
    
    // Validate input
    if (!expenseData.title || !expenseData.amount || !expenseData.category) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // In a real-world scenario, you'd want to implement server-side storage or authentication
    const expensesJson = typeof window !== 'undefined' 
      ? localStorage.getItem('expenses') 
      : null;
    
    const expenses: Expense[] = expensesJson 
      ? JSON.parse(expensesJson) 
      : [];

    // Generate a new ID
    const newExpense: Expense = {
      ...expenseData,
      id: expenses.length > 0 
        ? Math.max(...expenses.map(e => e.id || 0)) + 1 
        : 1,
      date: new Date(),
      userId: 'user_placeholder' // Replace with actual user ID from auth
    };

    expenses.push(newExpense);

    if (typeof window !== 'undefined') {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' }, 
      { status: 500 }
    );
  }
}

// DELETE expense by ID
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' }, 
        { status: 400 }
      );
    }

    // In a real-world scenario, you'd want to implement server-side storage or authentication
    const expensesJson = typeof window !== 'undefined' 
      ? localStorage.getItem('expenses') 
      : null;
    
    let expenses: Expense[] = expensesJson 
      ? JSON.parse(expensesJson) 
      : [];

    // Remove the expense with the given ID
    expenses = expenses.filter(expense => expense.id !== parseInt(id));

    if (typeof window !== 'undefined') {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }

    return NextResponse.json(
      { message: 'Expense deleted successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' }, 
      { status: 500 }
    );
  }
} 