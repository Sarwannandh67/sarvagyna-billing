
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, PlusCircle, Filter, ListChecks, MoreHorizontal, Loader2 } from "lucide-react";
import type { SavedInvoice } from "@/types/invoice"; 
import { INVOICES_STORAGE_KEY } from "@/types/invoice"; 
import { formatCurrency } from "@/lib/invoice-utils";
import { format, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  useEffect(() => {
    setIsLoading(true);
    const storedInvoicesRaw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!storedInvoicesRaw) {
      setInvoices([]);
    } else {
      try {
        const parsedInvoices: SavedInvoice[] = JSON.parse(storedInvoicesRaw);
        if (Array.isArray(parsedInvoices)) {
          // Deduplicate invoices based on ID
          const uniqueInvoices = parsedInvoices.reduce((acc: SavedInvoice[], current: SavedInvoice) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
              return acc.concat([current]);
            } else {
              console.warn(`Duplicate invoice ID found and removed for /invoices display: ${current.id}`);
              return acc;
            }
          }, []);
          setInvoices(uniqueInvoices);
        } else {
          console.warn("Loaded invoices from localStorage is not an array.");
          setInvoices([]);
        }
      } catch (e) {
        console.error("Error parsing invoices from localStorage:", e);
        setInvoices([]);
      }
    }
    setIsLoading(false);
  }, []);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString; 
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}/view`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/invoices/${invoiceId}/edit`);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceId}? This action cannot be undone.`)) {
      try {
        const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
        localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(updatedInvoices));
        setInvoices(updatedInvoices);
        toast({
          title: "Invoice Deleted",
          description: `Invoice ${invoiceId} has been successfully deleted.`,
        });
      } catch (e) {
        console.error("Error deleting invoice:", e);
        toast({
          title: "Error",
          description: "Could not delete invoice. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center">
            <ListChecks className="mr-3 h-8 w-8" /> Invoices
            </h1>
          <p className="text-muted-foreground mt-1">View and manage all your invoices.</p>
        </div>
        <Button asChild>
          <Link href="/">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Invoice
          </Link>
        </Button>
      </header>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by Invoice ID or Client Name..." 
                className="pl-8 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" disabled> 
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                 <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    {invoices.length === 0 ? <>No invoices found. <Link href="/" className="text-primary hover:underline">Create one now!</Link></> : 'No invoices match your search.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        invoice.status === "Paid" ? "bg-green-100 text-green-700" :
                        invoice.status === "Pending" || invoice.status === "Unpaid" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700" 
                      }`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice.id)}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice.id)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Invoice data is loaded from local storage. Some actions are placeholders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

