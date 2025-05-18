import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET all expenses
export async function GET() {
  try {
    const allExpenses = await db.select().from(expenses).orderBy(expenses.date);
    return NextResponse.json(allExpenses);
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
    const expenseData = await request.json();
    
    // Validate input
    if (!expenseData.title || !expenseData.amount || !expenseData.category) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Insert expense (assuming user authentication is handled elsewhere)
    const newExpense = await db.insert(expenses).values({
      title: expenseData.title,
      amount: expenseData.amount,
      category: expenseData.category,
      description: expenseData.description || null,
      userId: 'user_placeholder' // Replace with actual user ID from auth
    }).returning();

    return NextResponse.json(newExpense[0], { status: 201 });
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

    await db.delete(expenses).where(eq(expenses.id, parseInt(id)));

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