
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InvoiceForm } from '@/components/invoice-form';
import type { SavedInvoice } from '@/types/invoice';
import { INVOICES_STORAGE_KEY } from '@/types/invoice';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoiceToEdit, setInvoiceToEdit] = useState<SavedInvoice | null>(null);
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
            setInvoiceToEdit(foundInvoice || null);
          } else {
            setInvoiceToEdit(null);
          }
        } catch (e) {
          console.error("Error parsing invoices from localStorage:", e);
          setInvoiceToEdit(null);
        }
      } else {
        setInvoiceToEdit(null);
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setInvoiceToEdit(null);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Loading invoice for editing...</p>
      </div>
    );
  }

  if (!invoiceToEdit) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Invoice Not Found</h1>
        <p className="text-muted-foreground mb-6">The invoice you are trying to edit does not exist or could not be loaded.</p>
        <Button onClick={() => router.push('/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <InvoiceForm editingInvoiceData={invoiceToEdit} />
  );
}

