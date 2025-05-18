"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { DollarSign, FileText, Users, CreditCard, Briefcase, Loader2 } from "lucide-react"; // Removed Filter icon
import { MonthlyRevenueChart } from "@/components/monthly-revenue-chart";
// import { Input } from "@/components/ui/input"; // Removed as it was only used in filters
// import { Label } from "@/components/ui/label"; // Removed as it was only used in filters
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Removed as it was only used in filters
import type { SavedInvoice, Client, Transaction } from "@/types/invoice";
import { INVOICES_STORAGE_KEY, CLIENTS_STORAGE_KEY, TRANSACTIONS_STORAGE_KEY } from "@/types/invoice";
import { formatCurrency } from "@/lib/invoice-utils";
import { format, parseISO } from "date-fns";

interface KpiData {
  totalRevenue: number;
  averageInvoiceValue: number;
  invoicesPaid: number;
  totalClients: number;
  outstandingPayments: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpiData, setKpiData] = useState<KpiData>({
    totalRevenue: 0,
    averageInvoiceValue: 0,
    invoicesPaid: 0,
    totalClients: 0,
    outstandingPayments: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState<SavedInvoice[]>([]);
  const [topClientsData, setTopClientsData] = useState<Client[]>([]);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');

  // Client options for filters (kept for potential future use in other contexts, but not used in this version)
  // const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([{ value: "all", label: "All Clients" }]);
  // const paymentMethodOptions = [ 
  //   { value: "all", label: "All Methods" },
  //   { value: "card", label: "Card" },
  //   { value: "bank", label: "Bank Transfer" },
  //   { value: "upi", label: "UPI" },
  //   { value: "cash", label: "Cash" },
  // ];


  useEffect(() => {
    setIsLoading(true);
    let allInvoices: SavedInvoice[] = [];
    let allClients: Client[] = [];
    // let allTransactions: Transaction[] = []; // For future use if transactions influence KPIs directly

    const currencyFromStorage = typeof window !== 'undefined' ? localStorage.getItem('defaultCurrency') || 'INR' : 'INR';
    setDefaultCurrency(currencyFromStorage);

    try {
      const storedInvoicesRaw = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (storedInvoicesRaw) {
        const parsed = JSON.parse(storedInvoicesRaw);
        if (Array.isArray(parsed)) {
           // Deduplicate invoices based on ID to prevent key errors
          const uniqueInvoices = parsed.reduce((acc: SavedInvoice[], current: SavedInvoice) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
              return acc.concat([current]);
            } else {
              console.warn(`Duplicate invoice ID found and removed for dashboard display: ${current.id}`);
              return acc;
            }
          }, []);
          allInvoices = uniqueInvoices;
        }
      }

      const storedClientsRaw = localStorage.getItem(CLIENTS_STORAGE_KEY);
      if (storedClientsRaw) {
        const parsed = JSON.parse(storedClientsRaw);
        if (Array.isArray(parsed)) {
            allClients = parsed;
            // const options = [{ value: "all", label: "All Clients" }, ...parsed.map(c => ({value: c.id, label: c.name}))];
            // setClientOptions(options); // Not used now
        }
      }

      // const storedTransactionsRaw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      // if (storedTransactionsRaw) {
      //   const parsed = JSON.parse(storedTransactionsRaw);
      //   if (Array.isArray(parsed)) allTransactions = parsed;
      // }

    } catch (e) {
      console.error("Error loading data from localStorage for dashboard:", e);
    }

    // Calculate KPIs
    const paidInvoices = allInvoices.filter(inv => inv.status === "Paid");
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const invoicesPaidCount = paidInvoices.length;
    const averageInvoiceValue = invoicesPaidCount > 0 ? totalRevenue / invoicesPaidCount : 0;
    const outstandingPayments = allInvoices
      .filter(inv => inv.status === "Unpaid" || inv.status === "Pending" || inv.status === "Overdue")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalClients = allClients.length;

    setKpiData({
      totalRevenue,
      averageInvoiceValue,
      invoicesPaid: invoicesPaidCount,
      totalClients,
      outstandingPayments,
    });

    // Populate Recent Invoices (e.g., top 5 by issue date)
    const sortedRecentInvoices = [...allInvoices]
      .sort((a, b) => {
        try {
          return parseISO(b.issueDate).getTime() - parseISO(a.issueDate).getTime();
        } catch { return 0; }
      })
      .slice(0, 5);
    setRecentInvoices(sortedRecentInvoices);

    // Populate Top Clients (e.g., top 5 by total billed)
    const sortedTopClients = [...allClients]
      .sort((a, b) => (b.totalBilled || 0) - (a.totalBilled || 0))
      .slice(0, 5);
    setTopClientsData(sortedTopClients);
    
    setIsLoading(false);
  }, []);
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString; 
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Dashboard Insights</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your invoicing activity.</p>
      </header>

      {/* Filters Section Removed */}

      {/* KPIs Section */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Key Performance Indicators</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue (All Time)</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpiData.totalRevenue, defaultCurrency)}</div>
              <p className="text-xs text-muted-foreground">From all paid invoices</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Payments</CardTitle>
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpiData.outstandingPayments, defaultCurrency)}</div>
              <p className="text-xs text-muted-foreground">Across unpaid/pending invoices</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Invoice Value</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpiData.averageInvoiceValue, defaultCurrency)}</div>
              <p className="text-xs text-muted-foreground">Calculated from paid invoices</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices Paid</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{kpiData.invoicesPaid}</div>
              <p className="text-xs text-muted-foreground">Total paid invoices count</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{kpiData.totalClients}</div>
              <p className="text-xs text-muted-foreground">Total clients in system</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts and Detailed Insights Section */}
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Showing revenue over the past months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <MonthlyRevenueChart />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>A quick look at your latest invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <ul className="space-y-3">
                {recentInvoices.map((invoice: SavedInvoice) => (
                  <li key={invoice.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors">
                    <div className="mb-1 sm:mb-0">
                      <Link href={`/invoices/${invoice.id}/view`} className="font-medium hover:underline">{invoice.id}</Link>
                      <p className="text-xs text-muted-foreground">{invoice.clientName} - {formatDate(invoice.issueDate)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="font-semibold text-sm">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                       <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : invoice.status === 'Pending' || invoice.status === 'Unpaid' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{invoice.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-center text-muted-foreground py-4">No recent invoices to display.</p>
            )}
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link href="/invoices">View All Invoices</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Clients and Items Section */}
       <section className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Clients with the highest total billed amounts.</CardDescription>
          </CardHeader>
          <CardContent>
            {topClientsData.length > 0 ? (
              <ul className="space-y-3">
                {topClientsData.map((client: Client) => (
                  <li key={client.id} className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
                    <div className="flex items-center gap-3">
                       <Users className="h-5 w-5 text-primary" />
                       <span className="font-medium">{client.name}</span>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(client.totalBilled || 0, defaultCurrency)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-4">No client data available.</p>
            )}
             <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link href="/clients">View All Clients</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Top Items/Services</CardTitle>
            <CardDescription>Most frequently invoiced or highest revenue items.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Top items data logic would be more complex and requires item tracking */}
            <p className="text-center text-muted-foreground py-4">Item tracking not yet implemented.</p>
             <Button variant="outline" size="sm" className="w-full mt-4" asChild disabled>
                <Link href="/items">View All Items</Link>
            </Button>
          </CardContent>
        </Card>
      </section>


      {/* Call to action / Quick Links */}
      <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
            <Image 
              src="/logo-full.png" 
              alt="Sarvagyna Logo" 
              width={250} 
              height={160}
              data-ai-hint="office workspace"
              className="rounded-md object-cover" 
            />
            <div className="space-y-3">
                <p className="text-muted-foreground">
                Ready to get started or manage your finances?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild size="lg">
                    <Link href="/">Create New Invoice</Link>
                    </Button>
                    <Button asChild variant="secondary" size="lg">
                    <Link href="/clients">Manage Clients</Link>
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

    