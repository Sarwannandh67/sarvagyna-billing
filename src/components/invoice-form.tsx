"use client";

import type { InvoiceFormValues, CalculatedAmounts, Client, SavedInvoice, Transaction, InvoiceStatus } from '@/types/invoice';
import React from 'react';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { generateUUID } from '@/lib/utils';
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
import { FileDown, PlusCircle, Loader2, Save, Mail, ArrowLeft, Eye, Palette, X } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';


const INVOICE_PREVIEW_ID = "invoice-to-export";

interface InvoiceFormProps {
  editingInvoiceData?: SavedInvoice | null;
}

// Color preset types
interface ColorPreset {
  id: string;
  name: string;
  colors: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
  };
}

// Default color presets
const DEFAULT_COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'classic-blue',
    name: 'Classic Blue',
    colors: {
      primaryColor: '#1A5F7A',
      secondaryColor: '#159895',
      textColor: '#000000',
      backgroundColor: '#FFFFFF'
    }
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    colors: {
      primaryColor: '#8B7355',
      secondaryColor: '#D2691E',
      textColor: '#000000',
      backgroundColor: '#FFFAF0'
    }
  },
  {
    id: 'modern-green',
    name: 'Modern Green',
    colors: {
      primaryColor: '#2E8B57',
      secondaryColor: '#3CB371',
      textColor: '#000000',
      backgroundColor: '#F0FFF0'
    }
  },
  {
    id: 'corporate-gray',
    name: 'Corporate Gray',
    colors: {
      primaryColor: '#4A4A4A',
      secondaryColor: '#6A6A6A',
      textColor: '#000000',
      backgroundColor: '#F5F5F5'
    }
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    colors: {
      primaryColor: '#6A5ACD',
      secondaryColor: '#483D8B',
      textColor: '#000000',
      backgroundColor: '#F8F8FF'
    }
  }
];

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

  // New state for invoice colors
  const [invoiceColors, setInvoiceColors] = useState({
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    textColor: '#000000',
    backgroundColor: '#FFFFFF'
  });
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  // State for color presets
  const [savedColorPresets, setSavedColorPresets] = useState<ColorPreset[]>(() => {
    // Load saved presets from localStorage
    const storedPresets = localStorage.getItem('invoiceColorPresets');
    return storedPresets ? JSON.parse(storedPresets) : [];
  });

  const [newPresetName, setNewPresetName] = useState('');

  const resetToNewInvoice = () => {
    const newInvoiceNum = getNextInvoiceNumber();
    const clientIssueDate = format(new Date(), 'yyyy-MM-dd');
    const clientDueDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
    const clientInitialItem = { ...initialInvoiceItem, id: generateUUID() };

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
        id: item.id || generateUUID(), 
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

  const handleSave = (valuesOrEvent?: InvoiceFormValues | React.MouseEvent<HTMLButtonElement>) => {
    let values: InvoiceFormValues | undefined;
    if (valuesOrEvent && 'currentTarget' in valuesOrEvent) {
      // This is a button click event
      valuesOrEvent.preventDefault();
      valuesOrEvent.stopPropagation();
    } else if (valuesOrEvent && 'invoiceNumber' in valuesOrEvent) {
      // This is form values
      values = valuesOrEvent;
    }
    const formData = values || form.getValues();
    const currentFormData = {
      ...formData, 
      logoDataUrl: watchedLogoDataUrl, 
      invoiceNumber: invoiceNumber, 
      status: watchedStatus
    };

    // Validate the form
    const result = invoiceSchema.safeParse(currentFormData);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors.map(e => e.message).join(", "),
        variant: "destructive"
      });
      return;
    }

    // Prepare saved invoice data
    const savedInvoiceData: SavedInvoice = {
      ...currentFormData,
      id: invoiceNumber,
      clientName: currentFormData.billTo.name || 'Unnamed Client',
      totalAmount: calculatedTotals.total,
      status: currentFormData.status || "Unpaid",
      calculatedTotals: calculatedTotals,
      // Include custom colors when saving
      customColors: invoiceColors
    };

    // Retrieve existing invoices
    const storedInvoicesRaw = localStorage.getItem(INVOICES_STORAGE_KEY);
    let allInvoices: SavedInvoice[] = storedInvoicesRaw ? JSON.parse(storedInvoicesRaw) : [];

    // Check if editing an existing invoice
    const existingInvoiceIndex = allInvoices.findIndex(inv => inv.id === invoiceNumber);

    if (existingInvoiceIndex !== -1) {
      // Update existing invoice
      allInvoices[existingInvoiceIndex] = savedInvoiceData;
      toast({
        title: "Invoice Updated",
        description: `Invoice #${invoiceNumber} has been updated successfully.`
      });
    } else {
      // Add new invoice
      allInvoices.push(savedInvoiceData);
      commitUsedInvoiceNumber(invoiceNumber);
      toast({
        title: "Invoice Saved",
        description: `Invoice #${invoiceNumber} has been saved successfully.`
      });
    }

    // Save updated invoices list
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(allInvoices));

    // Optional: Reset form or navigate
    resetToNewInvoice();
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
    handleSave(currentValues);
    toast({
      title: isEditMode ? "Invoice Updated & Saved" : "Invoice Saved",
      description: `Invoice details saved before attempting to share via WhatsApp.`,
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
    append({
      ...initialInvoiceItem,
      id: generateUUID(),
    });
  };
  
  const currentFormData = {...form.getValues(), logoDataUrl: watchedLogoDataUrl, invoiceNumber: invoiceNumber, status: watchedStatus};

  const handleColorChange = (key: keyof typeof invoiceColors, value: string) => {
    setInvoiceColors(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaultColors = () => {
    setInvoiceColors({
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF',
      textColor: '#000000',
      backgroundColor: '#FFFFFF'
    });
  };

  const saveCurrentColorsAsPreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: "Preset Name Required",
        description: "Please enter a name for your color preset.",
        variant: "destructive"
      });
      return;
    }

    const newPreset: ColorPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      colors: invoiceColors
    };

    const updatedPresets = [...savedColorPresets, newPreset];
    setSavedColorPresets(updatedPresets);
    
    // Save to localStorage
    localStorage.setItem('invoiceColorPresets', JSON.stringify(updatedPresets));

    // Reset input and close modal
    setNewPresetName('');
    setIsColorModalOpen(false);

    toast({
      title: "Preset Saved",
      description: `Color preset "${newPreset.name}" has been saved.`
    });
  };

  const applyColorPreset = (preset: ColorPreset) => {
    setInvoiceColors(preset.colors);
    setIsColorModalOpen(false);
  };

  const deleteColorPreset = (presetId: string) => {
    const updatedPresets = savedColorPresets.filter(preset => preset.id !== presetId);
    setSavedColorPresets(updatedPresets);
    
    // Update localStorage
    localStorage.setItem('invoiceColorPresets', JSON.stringify(updatedPresets));

    toast({
      title: "Preset Deleted",
      description: "The color preset has been removed."
    });
  };

  return (
    <>
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
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Invoice Preview</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsColorModalOpen(true)}
                    >
                      <Palette className="mr-2 h-4 w-4" /> Colors
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto border rounded-md">
                      <InvoicePreview 
                        invoiceData={currentFormData} 
                        calculatedTotals={calculatedTotals} 
                        invoiceElementId={INVOICE_PREVIEW_ID}
                        customColors={invoiceColors}
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

      {/* Color Customization Modal */}
      <Dialog open={isColorModalOpen} onOpenChange={setIsColorModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customize Invoice Colors</DialogTitle>
            <DialogDescription>
              Personalize the colors of your invoice preview
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="custom">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">Custom Colors</TabsTrigger>
              <TabsTrigger value="presets">Color Presets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="primaryColor" className="text-right">
                    Primary Color
                  </Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={invoiceColors.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="secondaryColor" className="text-right">
                    Secondary Color
                  </Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={invoiceColors.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="textColor" className="text-right">
                    Text Color
                  </Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={invoiceColors.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="backgroundColor" className="text-right">
                    Background Color
                  </Label>
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={invoiceColors.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mt-4">
                  <Label htmlFor="presetName" className="text-right">
                    Save Preset
                  </Label>
                  <Input
                    id="presetName"
                    type="text"
                    placeholder="Enter preset name"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="col-span-2"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => saveCurrentColorsAsPreset()}
                    disabled={!newPresetName.trim()}
                  >
                    Save Preset
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="presets">
              <div className="grid gap-4 py-4">
                <h4 className="text-sm font-medium">Default Presets</h4>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {DEFAULT_COLOR_PRESETS.map((preset) => (
                      <div 
                        key={preset.id} 
                        className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent"
                        onClick={() => applyColorPreset(preset)}
                      >
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: preset.colors.primaryColor }}
                          />
                          <span className="text-sm">{preset.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <h4 className="text-sm font-medium mt-4">Your Saved Presets</h4>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {savedColorPresets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No saved presets yet. Create one by customizing colors and saving them.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {savedColorPresets.map((preset) => (
                        <div 
                          key={preset.id} 
                          className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent"
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-6 h-6 rounded-full" 
                              style={{ backgroundColor: preset.colors.primaryColor }}
                            />
                            <span className="text-sm">{preset.name}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => applyColorPreset(preset)}
                            >
                              Apply
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteColorPreset(preset.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primaryColor" className="text-right">
                Primary Color
              </Label>
              <Input
                id="primaryColor"
                type="color"
                value={invoiceColors.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secondaryColor" className="text-right">
                Secondary Color
              </Label>
              <Input
                id="secondaryColor"
                type="color"
                value={invoiceColors.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="textColor" className="text-right">
                Text Color
              </Label>
              <Input
                id="textColor"
                type="color"
                value={invoiceColors.textColor}
                onChange={(e) => handleColorChange('textColor', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="backgroundColor" className="text-right">
                Background Color
              </Label>
              <Input
                id="backgroundColor"
                type="color"
                value={invoiceColors.backgroundColor}
                onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={resetToDefaultColors}
            >
              Reset to Default
            </Button>
            <Button 
              onClick={() => setIsColorModalOpen(false)}
            >
              Apply Colors
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

