
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InvoicePreview } from '@/components/invoice-preview';
import type { SavedInvoice, CalculatedAmounts } from '@/types/invoice';
import { INVOICES_STORAGE_KEY } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

const INVOICE_PREVIEW_ID_VIEW = "invoice-view-preview";

export default function ViewInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState<SavedInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      const storedInvoicesRaw = localStorage.getItem(INVOICES_STORAGE_KEY);
      if (storedInvoicesRaw) {
        try {
          const allInvoices: SavedInvoice[] = JSON.parse(storedInvoicesRaw);
          if (Array.isArray(allInvoices)) {
            const foundInvoice = allInvoices.find(inv => inv.id === id);
            setInvoiceData(foundInvoice || null);
          } else {
            setInvoiceData(null);
          }
        } catch (e) {
          console.error("Error parsing invoices from localStorage:", e);
          setInvoiceData(null);
        }
      } else {
        setInvoiceData(null);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setInvoiceData(null);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Invoice Not Found</h1>
        <p className="text-muted-foreground mb-6">The invoice you are looking for does not exist or could not be loaded.</p>
        <Button onClick={() => router.push('/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
      </div>
    );
  }

  // The InvoicePreview component expects calculatedTotals. 
  // We can use the one stored during save, or recalculate if needed.
  // For simplicity, we'll use the stored one.
  const calculatedTotals: CalculatedAmounts = invoiceData.calculatedTotals || {
    subtotal: 0, discountAmount: 0, taxableAmount: 0, taxAmount: 0, total: 0,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary tracking-tight">View Invoice: {invoiceData.id}</h1>
        <Button variant="outline" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Invoices
        </Button>
      </div>
      <Card className="shadow-lg overflow-hidden">
        <CardContent className="p-0">
          <InvoicePreview 
            invoiceData={invoiceData} 
            calculatedTotals={calculatedTotals} 
            invoiceElementId={INVOICE_PREVIEW_ID_VIEW} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

