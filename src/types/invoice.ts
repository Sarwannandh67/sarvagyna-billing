import { z } from 'zod';

export const invoiceItemSchema = z.object({
  id: z.string(), 
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export const clientAddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional(),
});

export type ClientAddress = z.infer<typeof clientAddressSchema>;

export const invoiceStatusSchema = z.enum(["Paid", "Unpaid", "Pending", "Overdue"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceSchema = z.object({
  invoiceNumber: z.string(),
  issueDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid issue date" }),
  dueDate: z.string().optional().refine((date) => date ? !isNaN(Date.parse(date)) : true, { message: "Invalid due date" }),
  from: clientAddressSchema,
  billTo: clientAddressSchema,
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  paymentInstructions: z.string().optional(),
  discountRate: z.coerce.number().min(0).max(100).optional().default(0),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  shipping: z.coerce.number().min(0).optional().default(0),
  currency: z.string().min(1, "Currency is required").default("INR"),
  logoDataUrl: z.string().url().optional().or(z.literal('')),
  status: invoiceStatusSchema.optional().default("Unpaid"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export interface CalculatedAmounts {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
}

export const CURRENCIES = [
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "USD", label: "USD - United States Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

export const INVOICE_STATUSES: InvoiceStatus[] = ["Unpaid", "Paid", "Pending", "Overdue"];


export const initialInvoiceItem: InvoiceItem = {
  id: 'template-initial-item-id', 
  description: '',
  quantity: 1,
  unitPrice: 0,
};

const defaultTermsAndConditions = `- All services are subject to a 50% advance payment before project initiation.
- Final deliverables will be provided after full payment is received.
- Revisions are limited to 2 rounds unless otherwise specified.
- Turnaround time may vary based on the scope of work and will be communicated in advance.
- CreatorNex reserves the right to showcase completed work for portfolio and marketing purposes unless stated otherwise by the client.
- Urgent delivery may incur additional charges.
- Cancellations after work has begun are non-refundable.`;

export const defaultInvoiceValues: InvoiceFormValues = {
  invoiceNumber: '', 
  issueDate: '', 
  dueDate: '', 
  from: { name: '', address: '', email: '', phone: '' },
  billTo: { name: '', address: '', email: '', phone: '' },
  items: [{ 
    ...initialInvoiceItem,
    id: 'default-initial-item-id', 
  }],
  notes: '',
  termsAndConditions: defaultTermsAndConditions,
  paymentInstructions: '',
  discountRate: 0,
  taxRate: 0,
  shipping: 0,
  currency: 'INR', 
  logoDataUrl: '',
  status: "Unpaid",
};

// Types for localStorage
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalBilled?: number;
}

export interface SavedInvoice extends InvoiceFormValues {
  id: string; // Typically the invoiceNumber
  clientName: string;
  totalAmount: number;
  status: InvoiceStatus; 
  calculatedTotals: CalculatedAmounts;
  customColors?: {
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
  };
}

export type TransactionStatus = 'Paid' | 'Pending' | 'Failed';
export interface Transaction {
  id: string;
  invoiceId: string;
  date: string; // ISO string format
  amount: number;
  status: TransactionStatus;
  method: string; // e.g., 'Card', 'Bank Transfer', 'UPI', 'Cash', 'N/A'
  clientName: string; // For easier display in transaction lists
}

// localStorage keys
export const CLIENTS_STORAGE_KEY = 'sarvagynaClients';
export const INVOICES_STORAGE_KEY = 'sarvagynaInvoices';
export const TRANSACTIONS_STORAGE_KEY = 'sarvagynaTransactions';

    
