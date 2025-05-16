
"use client";

import type { InvoiceFormValues, CalculatedAmounts, Client, SavedInvoice, Transaction, InvoiceStatus } from '@/types/invoice';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema, defaultInvoiceValues, CURRENCIES, initialInvoiceItem, CLIENTS_STORAGE_KEY, INVOICES_STORAGE_KEY, TRANSACTIONS_STORAGE_KEY, INVOICE_STATUSES } from '@/types/invoice';
import { getNextInvoiceNumber, commitUsedInvoiceNumber, calculateInvoiceTotals, exportInvoiceToPDF, formatCurrency } from '@/lib/invoice-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AddressInputGroup } from '@/components/address-input-group';
import { InvoiceItemRow } from '@/components/invoice-item-row';
import { InvoicePreview } from '@/components/invoice-preview';
import { useToast } from "@/hooks/use-toast";
import { FileDown, PlusCircle, Loader2, Save, Mail, ArrowLeft } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';


const INVOICE_PREVIEW_ID = "invoice-to-export";

// Inline SVG for WhatsApp Icon
const WhatsAppIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.33 3.43 16.79L2 22L7.32 20.61C8.75 21.37 10.35 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.13C10.56 20.13 9.12 19.74 7.89 19.01L7.56 18.83L4.44 19.65L5.28 16.61L5.07 16.28C4.25 14.96 3.82 13.46 3.82 11.91C3.82 7.39 7.52 3.69 12.04 3.69C14.23 3.69 16.22 4.53 17.72 6.03C19.22 7.53 20.06 9.52 20.06 11.91C20.06 16.43 16.36 20.13 12.04 20.13ZM16.56 14.45C16.33 14.34 15.13 13.77 14.91 13.69C14.69 13.61 14.53 13.57 14.37 13.8C14.21 14.03 13.74 14.55 13.58 14.71C13.42 14.87 13.26 14.89 13.03 14.78C12.8 14.67 11.96 14.39 10.95 13.49C10.17 12.81 9.64 12.01 9.48 11.75C9.32 11.49 9.44 11.35 9.55 11.24C9.65 11.14 9.78 10.96 9.91 10.82C10.04 10.68 10.09 10.57 10.17 10.41C10.25 10.25 10.21 10.11 10.14 10.01C10.07 9.91 9.61 8.71 9.43 8.26C9.25 7.81 9.08 7.85 8.94 7.84H8.51C8.35 7.84 8.11 7.89 7.91 8.09C7.71 8.29 7.16 8.78 7.16 9.92C7.16 11.06 7.94 12.13 8.07 12.29C8.2 12.45 9.61 14.83 11.96 15.79C12.52 16.02 12.94 16.16 13.27 16.26C13.82 16.42 14.27 16.38 14.61 16.31C14.99 16.23 16.01 15.69 16.19 15.14C16.37 14.59 16.37 14.11 16.31 14C16.25 13.89 16.13 13.84 15.98 13.78C15.83 13.72 15.69 13.66 15.56 13.61L15.55 13.6C15.41 13.54 15.28 13.48 15.16 13.43L15.15 13.42C15.02 13.36 14.9 13.3 14.79 13.25L14.78 13.24C14.66 13.18 14.55 13.12 14.44 13.07L14.43 13.06C14.32 13 14.21 12.95 14.11 12.9L14.1 12.89C13.98 12.84 13.88 12.78 13.78 12.73L13.77 12.72C13.66 12.66 13.56 12.61 13.46 12.56L13.45 12.55C13.34 12.49 13.24 12.44 13.14 12.39L13.13 12.38C13.03 12.33 12.93 12.27 12.84 12.22L12.83 12.22C12.73 12.16 12.64 12.11 12.55 12.06L12.54 12.05C12.45 12 12.35 11.95 12.26 11.9L12.25 11.89C12.16 11.85 12.07 11.8 11.99 11.75L11.98 11.74C11.89 11.7 11.81 11.65 11.72 11.6L11.71 11.59C11.63 11.55 11.55 11.51 11.47 11.46L11.46 11.45C11.38 11.41 11.31 11.37 11.23 11.33L11.22 11.32C11.15 11.28 11.08 11.24 11.01 11.2L11 11.19C10.93 11.16 10.87 11.12 10.8 11.08L10.79 11.08C10.73 11.04 10.66 11.01 10.6 10.97L10.59 10.97C10.53 10.93 10.47 10.9 10.41 10.87L10.4 10.86C10.34 10.83 10.28 10.8 10.22 10.77L10.21 10.76C10.16 10.74 10.1 10.71 10.05 10.68L10.04 10.68C10 10.65 9.95 10.63 9.9 10.6L9.89 10.6C9.84 10.57 9.8 10.55 9.75 10.53L9.74 10.52C9.7 10.5 9.65 10.48 9.61 10.46L9.6 10.46C9.55 10.43 9.51 10.41 9.47 10.39L9.46 10.39C9.42 10.37 9.38 10.35 9.34 10.33L9.33 10.33C9.29 10.31 9.25 10.29 9.21 10.27L9.2 10.27C9.16 10.25 9.12 10.24 9.08 10.22L9.07 10.22C9.04 10.2 9 10.18 8.96 10.17L8.95 10.17C8.92 10.15 8.88 10.14 8.85 10.12L8.84 10.12C8.81 10.11 8.77 10.09 8.74 10.08L8.73 10.08C8.7 10.07 8.67 10.05 8.63 10.04L8.62 10.04C8.6 10.03 8.56 10.02 8.53 10.01L8.52 10C8.49 9.99 8.46 9.98 8.43 9.97L8.42 9.97C8.39 9.96 8.36 9.95 8.33 9.94L8.32 9.94C8.3 9.93 8.27 9.93 8.24 9.92L8.23 9.92C8.2 9.91 8.17 9.91 8.14 9.9L8.13 9.9C8.11 9.89 8.08 9.89 8.05 9.88L8.04 9.88C8.01 9.88 7.99 9.87 7.96 9.87L7.95 9.87C7.92 9.86 7.9 9.86 7.87 9.85L7.86 9.85C7.84 9.85 7.81 9.85 7.78 9.84L7.77 9.84C7.75 9.84 7.72 9.84 7.7 9.84L7.69 9.83C7.66 9.83 7.64 9.83 7.61 9.83L7.6 9.83C7.58 9.83 7.55 9.83 7.53 9.83L7.52 9.83C7.49 9.83 7.47 9.83 7.44 9.83L7.43 9.83C7.41 9.83 7.39 9.83 7.36 9.83L7.35 9.83C7.33 9.83 7.31 9.83 7.28 9.83L7.27 9.83C7.25 9.83 7.23 9.83 7.2 9.83L7.19 9.83C7.17 9.83 7.15 9.84 7.12 9.84L7.11 9.84C7.09 9.84 7.07 9.84 7.04 9.84L7.03 9.84C7.01 9.84 6.99 9.85 6.96 9.85L6.95 9.85C6.93 9.85 6.91 9.85 6.88 9.86L6.87 9.86C6.85 9.86 6.83 9.87 6.81 9.87L6.8 9.87C6.77 9.87 6.75 9.88 6.73 9.88L6.72 9.88C6.7 9.88 6.68 9.89 6.65 9.89L6.64 9.89C6.62 9.9 6.6 9.9 6.58 9.91L6.57 9.91C6.55 9.91 6.53 9.92 6.51 9.92L6.5 9.92C6.48 9.93 6.46 9.93 6.44 9.94L6.43 9.94C6.41 9.94 6.39 9.95 6.37 9.95L6.36 9.95C6.34 9.96 6.32 9.96 6.3 9.97L6.29 9.97C6.27 9.97 6.25 9.98 6.23 9.98L6.22 9.99C6.2 9.99 6.18 9.99 6.16 10L6.15 10C6.13 10.01 6.11 10.01 6.09 10.02L6.08 10.02C6.06 10.02 6.04 10.03 6.02 10.03L6.01 10.04C6 10.04 5.98 10.05 5.96 10.05L5.95 10.05C5.93 10.06 5.91 10.06 5.89 10.07L5.88 10.07C5.86 10.08 5.85 10.08 5.83 10.09L5.82 10.09C5.8 10.09 5.78 10.1 5.76 10.1L5.75 10.11C5.74 10.11 5.72 10.12 5.7 10.12L5.69 10.12C5.67 10.13 5.65 10.13 5.64 10.14L5.63 10.14C5.61 10.14 5.59 10.15 5.58 10.15L5.57 10.16C5.55 10.16 5.53 10.17 5.52 10.17L5.51 10.17C5.49 10.18 5.48 10.18 5.46 10.19L5.45 10.19C5.44 10.19 5.42 10.2 5.41 10.2L5.4 10.21C5.38 10.21 5.37 10.21 5.35 10.22L5.34 10.22C5.33 10.23 5.31 10.23 5.3 10.24L5.29 10.24C5.27 10.24 5.26 10.25 5.24 10.25L5.23 10.25C5.22 10.26 5.2 10.26 5.19 10.27L5.18 10.27C5.17 10.27 5.15 10.28 5.14 10.28L5.13 10.29C5.11 10.29 5.1 10.29 5.09 10.3L5.08 10.3C5.06 10.31 5.05 10.31 5.04 10.32L5.03 10.32C5.01 10.32 5 10.33 4.99 10.33L4.98 10.33C4.96 10.34 4.95 10.34 4.94 10.35L4.93 10.35C4.92 10.35 4.9 10.36 4.89 10.36L4.88 10.36C4.87 10.37 4.85 10.37 4.84 10.38L4.83 10.38C4.82 10.38 4.81 10.39 4.79 10.39L4.78 10.39C4.77 10.4 4.76 10.4 4.75 10.41L4.74 10.41C4.72 10.41 4.71 10.42 4.7 10.42L4.69 10.42C4.68 10.43 4.67 10.43 4.65 10.44L4.64 10.44C4.63 10.44 4.62 10.45 4.61 10.45L4.6 10.45C4.59 10.46 4.57 10.46 4.56 10.47L4.55 10.47C4.54 10.47 4.53 10.48 4.52 10.48L4.51 10.48C4.5 10.48 4.48 10.49 4.47 10.49L4.46 10.5C4.45 10.5 4.44 10.5 4.43 10.51L4.42 10.51C4.41 10.51 4.39 10.52 4.38 10.52L4.37 10.52C4.36 10.53 4.35 10.53 4.34 10.54L4.33 10.54C4.32 10.54 4.31 10.54 4.3 10.55L4.29 10.55C4.28 10.55 4.27 10.56 4.26 10.56L4.25 10.56C4.24 10.57 4.23 10.57 4.22 10.57L4.21 10.58C4.2 10.58 4.19 10.58 4.18 10.59L4.17 10.59C4.16 10.59 4.15 10.6 4.14 10.6L4.13 10.6C4.12 10.61 4.11 10.61 4.1 10.61L4.09 10.61C4.08 10.62 4.07 10.62 4.06 10.62L4.05 10.63C4.04 10.63 4.03 10.63 4.02 10.64L4.01 10.64C4 10.64 3.99 10.65 3.98 10.65L3.97 10.65C3.96 10.66 3.95 10.66 3.94 10.66L3.93 10.66C3.92 10.67 3.91 10.67 3.9 10.67L3.89 10.68C3.88 10.68 3.87 10.68 3.86 10.69L3.85 10.69C3.84 10.69 3.83 10.69 3.82 10.7L3.81 10.7C3.8 10.7 3.79 10.71 3.78 10.71L3.77 10.71C3.76 10.71 3.75 10.72 3.74 10.72L3.73 10.72C3.72 10.72 3.71 10.73 3.7 10.73L3.69 10.73C3.68 10.74 3.67 10.74 3.66 10.74L3.65 10.74C3.64 10.75 3.63 10.75 3.62 10.75L3.61 10.75C3.6 10.76 3.59 10.76 3.58 10.76L3.57 10.76C3.56 10.76 3.55 10.77 3.54 10.77L3.53 10.77C3.52 10.77 3.51 10.78 3.5 10.78L3.49 10.78C3.48 10.78 3.47 10.79 3.46 10.79L3.45 10.79C3.44 10.79 3.43 10.79 3.42 10.8L3.41 10.8C3.4 10.8 3.39 10.8 3.38 10.8L3.37 10.81C3.36 10.81 3.35 10.81 3.34 10.81L3.33 10.81C3.32 10.82 3.31 10.82 3.3 10.82L3.29 10.82C3.28 10.82 3.27 10.83 3.26 10.83L3.25 10.83C3.24 10.83 3.23 10.83 3.22 10.84L3.21 10.84C3.2 10.84 3.19 10.84 3.18 10.84L3.17 10.84C3.16 10.85 3.15 10.85 3.14 10.85L3.13 10.85C3.12 10.85 3.11 10.86 3.1 10.86L3.09 10.86C3.08 10.86 3.07 10.86 3.06 10.86L3.05 10.87C3.04 10.87 3.03 10.87 3.02 10.87L3.01 10.87C3.01 10.87 3 10.88 2.99 10.88L2.98 10.88C2.97 10.88 2.96 10.88 2.95 10.88L2.94 10.88C2.93 10.89 2.92 10.89 2.91 10.89L2.9 10.89C2.89 10.89 2.88 10.89 2.87 10.9L2.86 10.9C2.85 10.9 2.84 10.9 2.83 10.9L2.82 10.9C2.81 10.91 2.8 10.91 2.79 10.91L2.78 10.91C2.78 10.91 2.77 10.91 2.76 10.91L2.75 10.91C2.74 10.92 2.73 10.92 2.72 10.92L2.71 10.92C2.7 10.92 2.69 10.92 2.68 10.93L2.67 10.93C2.66 10.93 2.65 10.93 2.64 10.93L2.63 10.93C2.62 10.93 2.61 10.93 2.6 10.93L2.59 10.93C2.58 10.94 2.57 10.94 2.56 10.94L2.55 10.94C2.55 10.94 2.54 10.94 2.53 10.94L2.52 10.94C2.51 10.94 2.5 10.94 2.49 10.95L2.48 10.95C2.47 10.95 2.46 10.95 2.45 10.95L2.44 10.95C2.43 10.95 2.42 10.95 2.41 10.95L2.4 10.95C2.39 10.95 2.38 10.96 2.37 10.96L2.36 10.96C2.36 10.96 2.35 10.96 2.34 10.96L2.33 10.96C2.32 10.96 2.31 10.96 2.3 10.96L2.29 10.96C2.28 10.96 2.27 10.96 2.26 10.96L2.25 10.97C2.25 10.97 2.24 10.97 2.23 10.97L2.22 10.97C2.21 10.97 2.2 10.97 2.19 10.97L2.18 10.97C2.17 10.97 2.16 10.97 2.15 10.97L2.14 10.97C2.14 10.97 2.13 10.97 2.12 10.97L2.11 10.97C2.1 10.97 2.09 10.97 2.08 10.97L2.07 10.97C2.06 10.97 2.05 10.97 2.04 10.97L2.03 10.98C2.03 10.98 2.02 10.98 2.01 10.98L2 10.98C1.99 10.98 1.98 10.98 1.97 10.98L1.96 10.98C1.95 10.98 1.94 10.98 1.93 10.98L1.92 10.98C1.92 10.98 1.91 10.98 1.9 10.98L1.89 10.98C1.88 10.98 1.87 10.98 1.86 10.98L1.85 10.98C1.85 10.98 1.84 10.98 1.83 10.98L1.82 10.98C1.81 10.98 1.8 10.98 1.79 10.98L1.78 10.98C1.78 10.98 1.77 10.98 1.76 10.98L1.75 10.98C1.74 10.98 1.73 10.98 1.72 10.98L1.71 10.98C1.71 10.98 1.7 10.98 1.69 10.98L1.68 10.98C1.67 10.98 1.66 10.98 1.65 10.98L1.64 10.98C1.64 10.98 1.63 10.98 1.62 10.98L1.61 10.98C1.6 10.98 1.59 10.98 1.58 10.98L1.57 10.98C1.57 10.98 1.56 10.98 1.55 10.98L1.54 10.98C1.53 10.98 1.52 10.98 1.51 10.98L1.5 10.98C1.5 10.98 1.49 10.98 1.48 10.98L1.47 10.98C1.46 10.98 1.45 10.98 1.44 10.98L1.43 10.98C1.43 10.98 1.42 10.98 1.41 10.98L1.4 10.98C1.39 10.98 1.38 10.98 1.37 10.98L1.36 10.98C1.36 10.98 1.35 10.98 1.34 10.98L1.33 10.98C1.32 10.98 1.31 10.98 1.3 10.98L1.29 10.98C1.29 10.98 1.28 10.98 1.27 10.98L1.26 10.98C1.25 10.98 1.24 10.98 1.23 10.98L1.22 10.98C1.22 10.98 1.21 10.98 1.2 10.98L1.19 10.98C1.18 10.98 1.17 10.98 1.16 10.98L1.15 10.98C1.15 10.98 1.14 10.98 1.13 10.98L1.12 10.98C1.11 10.98 1.1 10.98 1.09 10.98L1.08 10.98C1.08 10.98 1.07 10.98 1.06 10.98L1.05 10.98C1.04 10.98 1.03 10.98 1.02 10.98L1.01 10.98C1.01 10.98 1 10.98 0.99 10.98L0.98 10.98C0.97 10.98 0.96 10.98 0.95 10.98L0.94 10.98C0.94 10.98 0.93 10.98 0.92 10.98L0.91 10.98C0.9 10.98 0.89 10.98 0.88 10.98L0.87 10.98C0.87 10.98 0.86 10.98 0.85 10.98L0.84 10.98C0.83 10.98 0.82 10.98 0.81 10.98L0.8 10.98C0.8 10.98 0.79 10.98 0.78 10.98L0.77 10.98C0.76 10.98 0.75 10.98 0.74 10.98L0.73 10.98C0.73 10.98 0.72 10.98 0.71 10.98L0.7 10.98C0.69 10.98 0.68 10.98 0.67 10.98L0.66 10.98C0.66 10.98 0.65 10.98 0.64 10.98L0.63 10.98C0.62 10.98 0.61 10.98 0.6 10.98L0.59 10.98C0.59 10.98 0.58 10.98 0.57 10.98L0.56 10.98C0.55 10.98 0.54 10.98 0.53 10.98L0.52 10.98C0.52 10.98 0.51 10.98 0.5 10.98L0.49 10.98C0.48 10.98 0.47 10.98 0.46 10.98L0.45 10.98C0.45 10.98 0.44 10.98 0.43 10.98L0.42 10.98C0.41 10.98 0.4 10.98 0.39 10.98L0.38 10.98C0.38 10.98 0.37 10.98 0.36 10.98L0.35 10.98C0.34 10.98 0.33 10.98 0.32 10.98L0.31 10.98C0.31 10.98 0.3 10.98 0.29 10.98L0.28 10.98C0.27 10.98 0.26 10.98 0.25 10.98L0.24 10.98C0.24 10.98 0.23 10.98 0.22 10.98L0.21 10.98C0.2 10.98 0.19 10.98 0.18 10.98L0.17 10.98C0.17 10.98 0.16 10.98 0.15 10.98L0.14 10.98C0.13 10.98 0.12 10.98 0.11 10.98L0.1 10.98C0.1 10.98 0.09 10.98 0.08 10.98L0.07 10.98C0.06 10.98 0.05 10.98 0.04 10.98L0.03 10.98C0.03 10.98 0.02 10.98 0.01 10.98L0 10.98Z" />
  </svg>
);

interface InvoiceFormProps {
  editingInvoiceData?: SavedInvoice | null;
}

export function InvoiceForm({ editingInvoiceData = null }: InvoiceFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const isEditMode = !!editingInvoiceData;
  
  const [invoiceNumber, setInvoiceNumber] = useState(
    isEditMode && editingInvoiceData ? editingInvoiceData.invoiceNumber : defaultInvoiceValues.invoiceNumber
  );

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: isEditMode && editingInvoiceData ? editingInvoiceData : defaultInvoiceValues,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
    keyName: 'fieldId',
  });

  const resetToNewInvoice = () => {
    const newInvoiceNum = getNextInvoiceNumber();
    const clientIssueDate = format(new Date(), 'yyyy-MM-dd');
    const clientDueDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
    const clientInitialItem = { ...initialInvoiceItem, id: crypto.randomUUID() };

    const companyLogo = typeof window !== 'undefined' ? localStorage.getItem('companyLogoDataUrl') : null;
    const companyName = typeof window !== 'undefined' ? localStorage.getItem('companyName') : '';
    const companyAddress = typeof window !== 'undefined' ? localStorage.getItem('companyAddress') : '';
    const companyEmail = typeof window !== 'undefined' ? localStorage.getItem('companyEmail') : '';
    const companyPhone = typeof window !== 'undefined' ? localStorage.getItem('companyPhone') : '';
    
    const defaultCurrency = typeof window !== 'undefined' ? localStorage.getItem('defaultCurrency') || 'INR' : 'INR';
    const defaultTaxRate = typeof window !== 'undefined' ? parseFloat(localStorage.getItem('defaultTaxRate') || '0') : 0;
    const defaultTerms = typeof window !== 'undefined' ? localStorage.getItem('defaultPaymentTerms') || defaultInvoiceValues.termsAndConditions : defaultInvoiceValues.termsAndConditions;
    const defaultPaymentInstructions = typeof window !== 'undefined' ? localStorage.getItem('defaultPaymentInstructions') || defaultInvoiceValues.paymentInstructions : defaultInvoiceValues.paymentInstructions;

    form.reset({
      ...defaultInvoiceValues,
      invoiceNumber: newInvoiceNum,
      issueDate: clientIssueDate,
      dueDate: clientDueDate,
      from: {
        name: companyName || defaultInvoiceValues.from.name,
        address: companyAddress || defaultInvoiceValues.from.address,
        email: companyEmail || defaultInvoiceValues.from.email,
        phone: companyPhone || defaultInvoiceValues.from.phone,
      },
      billTo: { name: '', address: '', email: '', phone: '' },
      items: [clientInitialItem],
      logoDataUrl: companyLogo || defaultInvoiceValues.logoDataUrl,
      notes: '',
      termsAndConditions: defaultTerms,
      paymentInstructions: defaultPaymentInstructions,
      discountRate: 0,
      taxRate: defaultTaxRate,
      shipping: 0,
      currency: defaultCurrency,
      status: "Unpaid", // Default status for new invoices
    });
    setInvoiceNumber(newInvoiceNum);
  };
  
  useEffect(() => {
    if (isEditMode && editingInvoiceData) {
      const itemsWithIds = editingInvoiceData.items.map(item => ({
        ...item,
        id: item.id || crypto.randomUUID(), 
      }));
      form.reset({ ...editingInvoiceData, items: itemsWithIds });
      setInvoiceNumber(editingInvoiceData.invoiceNumber);
    } else {
      resetToNewInvoice();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editingInvoiceData]); 

  const watchedItems = form.watch('items');
  const watchedDiscountRate = form.watch('discountRate');
  const watchedTaxRate = form.watch('taxRate');
  const watchedShipping = form.watch('shipping');
  const watchedCurrency = form.watch('currency');
  const watchedLogoDataUrl = form.watch('logoDataUrl');
  const watchedStatus = form.watch('status'); // Watch status

  const [calculatedTotals, setCalculatedTotals] = useState<CalculatedAmounts>(
    calculateInvoiceTotals(
      (isEditMode && editingInvoiceData ? editingInvoiceData.items : defaultInvoiceValues.items), 
      (isEditMode && editingInvoiceData ? editingInvoiceData.discountRate : defaultInvoiceValues.discountRate),
      (isEditMode && editingInvoiceData ? editingInvoiceData.taxRate : defaultInvoiceValues.taxRate),
      (isEditMode && editingInvoiceData ? editingInvoiceData.shipping : defaultInvoiceValues.shipping)
    )
  );

  useEffect(() => {
    const totals = calculateInvoiceTotals(
      watchedItems,
      watchedDiscountRate,
      watchedTaxRate,
      watchedShipping
    );
    setCalculatedTotals(totals);
  }, [watchedItems, watchedDiscountRate, watchedTaxRate, watchedShipping]);

  const onSubmitForExport = async (data: InvoiceFormValues) => {
    setIsGeneratingPdf(true);
    try {
      await exportInvoiceToPDF(INVOICE_PREVIEW_ID, `${data.invoiceNumber || 'invoice'}.pdf`);
      toast({
        title: "PDF Exported",
        description: "Invoice has been successfully exported as PDF.",
      });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast({
        title: "PDF Export Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSaveLogic = (data: InvoiceFormValues) => {
    const currentCalculatedTotals = calculateInvoiceTotals(data.items, data.discountRate, data.taxRate, data.shipping);
    const clientNameFromForm = data.billTo.name;
    const clientEmailFromForm = data.billTo.email || '';
    const invoiceStatus = data.status || 'Unpaid'; // Get status from form data

    // Client handling
    let allClients: Client[] = [];
    try {
        const storedClientsRaw = localStorage.getItem(CLIENTS_STORAGE_KEY);
        if (storedClientsRaw) {
            const parsed = JSON.parse(storedClientsRaw);
            if (Array.isArray(parsed)) allClients = parsed;
        }
    } catch (e) { console.error("Error parsing clients: ", e); allClients = []; }

    let clientRecord = allClients.find(c => c.name === clientNameFromForm && (c.email || '') === clientEmailFromForm);
    
    if (isEditMode && editingInvoiceData && clientRecord) {
      const oldInvoiceTotal = editingInvoiceData.calculatedTotals.total;
      clientRecord.totalBilled = (clientRecord.totalBilled || 0) - oldInvoiceTotal + currentCalculatedTotals.total;
      clientRecord.address = data.billTo.address;
      clientRecord.phone = data.billTo.phone;
    } else if (clientRecord) {
      clientRecord.totalBilled = (clientRecord.totalBilled || 0) + currentCalculatedTotals.total;
      clientRecord.address = data.billTo.address;
      clientRecord.phone = data.billTo.phone;
    } else {
      clientRecord = {
          id: crypto.randomUUID(), 
          name: clientNameFromForm,
          email: clientEmailFromForm,
          phone: data.billTo.phone,
          address: data.billTo.address,
          totalBilled: currentCalculatedTotals.total,
      };
      allClients.push(clientRecord);
    }
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(allClients));

    // Invoice handling
    let allInvoices: SavedInvoice[] = [];
    try {
        const storedInvoicesRaw = localStorage.getItem(INVOICES_STORAGE_KEY);
        if (storedInvoicesRaw) {
            const parsed = JSON.parse(storedInvoicesRaw);
            if (Array.isArray(parsed)) allInvoices = parsed;
        }
    } catch (e) { console.error("Error parsing invoices: ", e); allInvoices = []; }

    const invoiceToSave: SavedInvoice = {
      ...data,
      id: data.invoiceNumber, 
      clientName: data.billTo.name,
      totalAmount: currentCalculatedTotals.total,
      status: invoiceStatus, // Use status from form
      calculatedTotals: currentCalculatedTotals,
    };
    
    if (isEditMode) {
      const index = allInvoices.findIndex(inv => inv.id === invoiceToSave.id);
      if (index > -1) allInvoices[index] = invoiceToSave;
      else allInvoices.push(invoiceToSave); 
    } else {
      allInvoices.push(invoiceToSave);
      commitUsedInvoiceNumber(invoiceToSave.id);
    }
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(allInvoices));

    // Transaction handling
    let allTransactions: Transaction[] = [];
    try {
        const storedTransactionsRaw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
        if (storedTransactionsRaw) {
            const parsed = JSON.parse(storedTransactionsRaw);
            if (Array.isArray(parsed)) allTransactions = parsed;
        }
    } catch (e) { console.error("Error parsing transactions: ", e); allTransactions = []; }

    const transactionStatus = invoiceStatus === "Paid" ? "Paid" : "Pending";

    if (isEditMode && editingInvoiceData) {
        const transactionIndex = allTransactions.findIndex(t => t.invoiceId === editingInvoiceData.id);
        if (transactionIndex > -1) {
            allTransactions[transactionIndex].amount = currentCalculatedTotals.total;
            allTransactions[transactionIndex].clientName = invoiceToSave.clientName;
            allTransactions[transactionIndex].status = transactionStatus;
        } else { 
            const newTransaction: Transaction = {
                id: `TRANS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                invoiceId: invoiceToSave.id,
                date: new Date().toISOString(), 
                amount: invoiceToSave.totalAmount,
                status: transactionStatus, 
                method: 'N/A', 
                clientName: invoiceToSave.clientName,
            };
            allTransactions.push(newTransaction);
        }
    } else {
        const newTransaction: Transaction = {
            id: `TRANS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            invoiceId: invoiceToSave.id,
            date: new Date().toISOString(), 
            amount: invoiceToSave.totalAmount,
            status: transactionStatus, 
            method: 'N/A', 
            clientName: invoiceToSave.clientName,
        };
        allTransactions.push(newTransaction);
    }
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(allTransactions));
    
    return invoiceToSave.id; 
  };


  const handleSave = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const currentValues = form.getValues();
      const savedInvoiceId = handleSaveLogic(currentValues);
      toast({
        title: isEditMode ? "Invoice Updated" : "Invoice Saved",
        description: `Invoice ${savedInvoiceId} details ${isEditMode ? 'updated' : 'saved'} to local storage.`,
      });
      if (isEditMode) {
        router.push('/invoices'); 
      } else {
        resetToNewInvoice(); 
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before saving.",
        variant: "destructive",
      });
    }
  };

  const handleShareEmail = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required invoice details before sharing.",
        variant: "destructive",
      });
      return;
    }
    const data = form.getValues();
    const { from: company, billTo: client, invoiceNumber: invNum, dueDate } = data;
    const totals = calculateInvoiceTotals(data.items, data.discountRate, data.taxRate, data.shipping);

    const subject = `Invoice from ${company.name || 'Your Company'} - Invoice #${invNum}`;
    const body = `Dear ${client.name || 'Client'},

Please find your invoice details below:
Invoice Number: ${invNum}
Total Amount Due: ${formatCurrency(totals.total, data.currency)}
${dueDate ? `Due Date: ${format(parseISO(dueDate), 'MMM dd, yyyy')}` : ''}

Thank you for your business!

Sincerely,
${company.name || 'Your Company'}
${company.address || ''}
${company.email || ''}
${company.phone || ''}
`;
    window.location.href = `mailto:${client.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareWhatsApp = async () => {
    const isValid = await form.trigger(); 
    if (!isValid) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required invoice details before sharing.",
        variant: "destructive",
      });
      return;
    }

    const currentValues = form.getValues();
    const savedInvoiceId = handleSaveLogic(currentValues); 
    toast({
      title: isEditMode ? "Invoice Updated & Saved" : "Invoice Saved",
      description: `Invoice ${savedInvoiceId} details saved before attempting to share via WhatsApp.`,
    });
    
    if (!isEditMode) {
        resetToNewInvoice(); 
    }

    const { from: company, billTo: client, invoiceNumber: invNum, dueDate, currency } = currentValues;
    const totals = calculateInvoiceTotals(currentValues.items, currentValues.discountRate, currentValues.taxRate, currentValues.shipping);
    
    let message = `Hi ${client.name || 'Client'}, here is your invoice #${invNum} from ${company.name || 'Your Company'} for ${formatCurrency(totals.total, currency)}.`;
    if (dueDate) {
      try {
        message += ` It is due on ${format(parseISO(dueDate), 'MMM dd, yyyy')}.`;
      } catch (e) {
        console.warn("Could not parse due date for WhatsApp message:", dueDate);
      }
    }
    message += ` Thank you!`;
    
    const whatsappUrl = `https://wa.me/${client.phone || ''}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };


  const addNewItem = () => {
    append({ ...initialInvoiceItem, id: crypto.randomUUID() });
  };
  
  const currentFormData = {...form.getValues(), logoDataUrl: watchedLogoDataUrl, invoiceNumber: invoiceNumber, status: watchedStatus};

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForExport)} className="space-y-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-primary tracking-tight sm:text-2xl">
              {isEditMode ? `Edit Invoice: ${editingInvoiceData?.id}` : 'Create New Invoice'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? 'Modify the details below and update the invoice.' : 'Fill in the details below to generate your invoice.'}
            </p>
          </div>
          {isEditMode && (
            <Button variant="outline" onClick={() => router.push('/invoices')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Cancel Edit
            </Button>
          )}
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <Input value={invoiceNumber} readOnly className="bg-muted cursor-not-allowed" />
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  {isEditMode && ( // Only show status field in edit mode
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="mt-4 md:col-span-1">
                          <FormLabel>Invoice Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INVOICE_STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AddressInputGroup form={form} title="From" fieldNamePrefix="from" isFromSection={true} />
              <AddressInputGroup form={form} title="Bill To" fieldNamePrefix="billTo" />
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="hidden sm:grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-right">Quantity</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div> 
                </div>
                {fields.map((field, index) => (
                  <InvoiceItemRow
                    key={field.fieldId} 
                    index={index}
                    control={form.control}
                    remove={remove}
                    currency={watchedCurrency}
                    errors={form.formState.errors}
                    itemValue={watchedItems[index]}
                  />
                ))}
                 {form.formState.errors.items && typeof form.formState.errors.items === 'object' && !Array.isArray(form.formState.errors.items) && (
                    <FormMessage>{form.formState.errors.items.message}</FormMessage>
                  )}
                <Button type="button" variant="outline" onClick={addNewItem} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Summary, Notes &amp; Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div> 
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CURRENCIES.map(c => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="discountRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} value={field.value || 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} value={field.value || 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shipping"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} value={field.value || 0} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm pt-0 md:pt-8"> 
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span className="font-medium">{formatCurrency(calculatedTotals.subtotal, watchedCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount ({watchedDiscountRate || 0}%):</span>
                          <span className="font-medium text-destructive">- {formatCurrency(calculatedTotals.discountAmount, watchedCurrency)}</span>
                      </div>
                       <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxable Amount:</span>
                          <span className="font-medium">{formatCurrency(calculatedTotals.taxableAmount, watchedCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax ({watchedTaxRate || 0}%):</span>
                          <span className="font-medium">{formatCurrency(calculatedTotals.taxAmount, watchedCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping:</span>
                          <span className="font-medium">{formatCurrency(watchedShipping || 0, watchedCurrency)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-primary">
                          <span>Total:</span>
                          <span>{formatCurrency(calculatedTotals.total, watchedCurrency)}</span>
                      </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional notes for the client..." {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms &amp; Conditions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="E.g., Payment due within 30 days." {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Instructions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="E.g., Bank: XYZ, Account: 12345, UPI: yourid@upi" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                 <Button type="button" variant="outline" onClick={handleSave} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" /> {isEditMode ? "Update Invoice" : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={handleShareEmail} className="w-full sm:w-auto">
                    <Mail className="mr-2 h-4 w-4" /> Share via Email
                </Button>
                <Button type="button" variant="outline" onClick={handleShareWhatsApp} className="w-full sm:w-auto">
                    <WhatsAppIcon /> Share via WhatsApp
                </Button>
                <Button type="submit" disabled={isGeneratingPdf} className="w-full sm:w-auto">
                  {isGeneratingPdf ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  {isGeneratingPdf ? 'Generating...' : 'Export to PDF'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-1 relative">
            <div className="sticky top-8 space-y-6">
              <Card className="shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle>Invoice Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[calc(100vh-12rem)] overflow-y-auto border rounded-md">
                    <InvoicePreview 
                      invoiceData={currentFormData} 
                      calculatedTotals={calculatedTotals} 
                      invoiceElementId={INVOICE_PREVIEW_ID}
                    />
                  </div>
                </CardContent>
              </Card>
               <div className="flex flex-col gap-3 lg:hidden"> 
                  <Button type="button" variant="outline" onClick={handleSave} className="w-full">
                      <Save className="mr-2 h-4 w-4" /> {isEditMode ? "Update Invoice" : "Save"}
                  </Button>
                   <Button type="button" variant="outline" onClick={handleShareEmail} className="w-full">
                    <Mail className="mr-2 h-4 w-4" /> Share via Email
                  </Button>
                  <Button type="button" variant="outline" onClick={handleShareWhatsApp} className="w-full">
                      <WhatsAppIcon /> Share via WhatsApp
                  </Button>
                  <Button type="submit" disabled={isGeneratingPdf} className="w-full">
                    {isGeneratingPdf ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    {isGeneratingPdf ? 'Generating...' : 'Export to PDF'}
                  </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

