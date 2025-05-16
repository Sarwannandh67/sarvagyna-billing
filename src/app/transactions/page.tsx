
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Repeat, Download, Eye, TrendingUp, Clock, AlertCircle, DollarSign, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction, SavedInvoice } from "@/types/invoice"; 
import { TRANSACTIONS_STORAGE_KEY, INVOICES_STORAGE_KEY } from "@/types/invoice"; 
import { formatCurrency } from "@/lib/invoice-utils";
import { format, parseISO, startOfMonth, isBefore, isAfter, addDays } from "date-fns";
import { MonthlyTransactionsChart } from "@/components/monthly-transactions-chart";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [exportFromDate, setExportFromDate] = useState<string>('');
  const [exportToDate, setExportToDate] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (storedTransactions) {
      try {
        const parsedTransactions = JSON.parse(storedTransactions);
        if (Array.isArray(parsedTransactions)) {
          setTransactions(parsedTransactions);
        } else {
          setTransactions([]);
        }
      } catch (e) {
        setTransactions([]);
      }
    } else {
      setTransactions([]);
    }

    const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (storedInvoices) {
      try {
        const parsedInvoices = JSON.parse(storedInvoices);
        if (Array.isArray(parsedInvoices)) {
          setInvoices(parsedInvoices);
        } else {
          setInvoices([]);
        }
      } catch (e) {
        setInvoices([]);
      }
    } else {
      setInvoices([]);
    }
    
    const currencyFromStorage = typeof window !== 'undefined' ? localStorage.getItem('defaultCurrency') || 'INR' : 'INR';
    setDefaultCurrency(currencyFromStorage);
    setIsLoading(false);

  }, []);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString; 
    }
  };
  
  const handleExportTransactions = () => {
    if (transactions.length === 0) {
      alert("No transactions to export."); // Consider using toast for better UX
      return;
    }

    let transactionsToExport = [...transactions];

    if (exportFromDate) {
      try {
        const fromDateObj = parseISO(exportFromDate);
        transactionsToExport = transactionsToExport.filter(t => {
          try {
            return !isBefore(parseISO(t.date), fromDateObj);
          } catch { return true; } // Keep transaction if its date is unparseable
        });
      } catch (e) {
        alert("Invalid 'From Date' for export.");
        return;
      }
    }

    if (exportToDate) {
      try {
        const toDateObj = parseISO(exportToDate);
        transactionsToExport = transactionsToExport.filter(t => {
          try {
            return !isAfter(parseISO(t.date), addDays(toDateObj,1));
          } catch { return true; } // Keep transaction if its date is unparseable
        });
      } catch (e) {
        alert("Invalid 'To Date' for export.");
        return;
      }
    }
    
    if (transactionsToExport.length === 0) {
      alert("No transactions match the selected date range for export.");
      return;
    }

    const csvHeader = [
      "Transaction ID",
      "Invoice ID",
      "Date",
      "Client Name",
      `Amount (${defaultCurrency})`,
      "Status",
      "Method"
    ];

    const csvRows = transactionsToExport.map(t => [
      `"${t.id.replace(/"/g, '""')}"`, // Escape double quotes within data
      `"${t.invoiceId.replace(/"/g, '""')}"`,
      `"${formatDate(t.date).replace(/"/g, '""')}"`,
      `"${t.clientName.replace(/"/g, '""')}"`,
      t.amount.toString(), // Amount is a number, no need to quote unless specified
      `"${t.status.replace(/"/g, '""')}"`,
      `"${t.method.replace(/"/g, '""')}"`
    ].join(','));

    const csvString = [csvHeader.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    const fromDateSuffix = exportFromDate ? `_from_${exportFromDate}` : '';
    const toDateSuffix = exportToDate ? `_to_${exportToDate}` : '';
    link.setAttribute("download", `transactions${fromDateSuffix}${toDateSuffix}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  const kpiData = useMemo(() => {
    const today = new Date();
    const paidTotal = transactions
      .filter(t => t.status === "Paid")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingTotal = transactions
      .filter(t => t.status === "Pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingOnOverdueInvoicesTotal = transactions
      .filter(t => {
        if (t.status !== "Pending") return false;
        const linkedInvoice = invoices.find(inv => inv.id === t.invoiceId);
        if (!linkedInvoice || linkedInvoice.status === "Paid" || !linkedInvoice.dueDate) return false;
        try {
            return isBefore(parseISO(linkedInvoice.dueDate), today);
        } catch {
            return false;
        }
      })
      .reduce((sum, t) => sum + t.amount, 0);
      
    return { paidTotal, pendingTotal, pendingOnOverdueInvoicesTotal };
  }, [transactions, invoices]);

  const monthlyTransactionData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (t.status === "Paid") { 
        try {
          const monthYear = format(parseISO(t.date), "MMM yyyy");
          monthlyData[monthYear] = (monthlyData[monthYear] || 0) + t.amount;
        } catch {
          // console.warn("Could not parse transaction date for monthly analytics:", t.date);
        }
      }
    });
    return Object.entries(monthlyData)
      .map(([month, totalAmount]) => ({ month, totalAmount }))
      .sort((a,b) => {
        try {
          return parseISO(format(new Date(a.month), 'yyyy-MM-dd')).getTime() - parseISO(format(new Date(b.month), 'yyyy-MM-dd')).getTime();
        } catch {
          return 0;
        }
      });
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center">
            <Repeat className="mr-3 h-8 w-8" /> Transactions
          </h1>
          <p className="text-muted-foreground mt-1">View payment status and history for your invoices.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-2 w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
            <div>
              <Label htmlFor="exportFromDate" className="text-xs font-medium">From Date</Label>
              <Input
                type="date"
                id="exportFromDate"
                value={exportFromDate}
                onChange={(e) => setExportFromDate(e.target.value)}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="exportToDate" className="text-xs font-medium">To Date</Label>
              <Input
                type="date"
                id="exportToDate"
                value={exportToDate}
                onChange={(e) => setExportToDate(e.target.value)}
                className="h-9 mt-1"
              />
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleExportTransactions} 
            disabled={transactions.length === 0} 
            className="w-full sm:w-auto mt-2 sm:mt-0" // Added margin top for mobile
          >
              <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </header>

      {/* KPI Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.paidTotal, defaultCurrency)}</div>
            <p className="text-xs text-muted-foreground">Sum of all paid transactions</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.pendingTotal, defaultCurrency)}</div>
            <p className="text-xs text-muted-foreground">Sum of all pending transactions</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending (Overdue Invoices)</CardTitle>
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.pendingOnOverdueInvoicesTotal, defaultCurrency)}</div>
            <p className="text-xs text-muted-foreground">Pending payments for past due date invoices</p>
          </CardContent>
        </Card>
      </section>

      {/* Monthly Transaction Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Monthly Paid Transactions</CardTitle>
          <CardDescription>Showing total paid transaction amounts over the past months.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <MonthlyTransactionsChart data={monthlyTransactionData} currency={defaultCurrency} />
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Invoice ID, Client, or Transaction ID..." 
                className="pl-8 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-2 w-full md:w-auto">
                <Select defaultValue="all-status" disabled>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-status">All Statuses</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="all-methods" disabled>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by Method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-methods">All Methods</SelectItem>
                        <SelectItem value="card">Credit Card</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button className="w-full md:w-auto" disabled>
              <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                     {transactions.length === 0 ? 'No transactions found. Save an invoice to create a transaction.' : 'No transactions match your search.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium text-xs truncate" style={{maxWidth: '120px'}}>{transaction.id}</TableCell>
                    <TableCell>{transaction.invoiceId}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.clientName}</TableCell>
                    <TableCell>{formatCurrency(transaction.amount, defaultCurrency)}</TableCell> 
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        transaction.status === "Paid" ? "bg-green-100 text-green-700" :
                        transaction.status === "Pending" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700" // For Failed or other statuses
                      }`}>
                        {transaction.status}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => alert(`View details for transaction: ${transaction.id}\n(Functionality to be implemented)`)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
           <p className="text-xs text-muted-foreground mt-4 text-center">
            Transaction data is loaded from local storage. Further details and actions coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

