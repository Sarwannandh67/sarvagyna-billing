
"use client";

import type { InvoiceFormValues, CalculatedAmounts } from '@/types/invoice';
import { formatCurrency, calculateItemTotal } from '@/lib/invoice-utils';
import { Separator } from '@/components/ui/separator';
import { parse, isValid, format as formatDateFn } from 'date-fns'; // Renamed format to formatDateFn
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface InvoicePreviewProps {
  invoiceData: InvoiceFormValues;
  calculatedTotals: CalculatedAmounts;
  invoiceElementId: string;
}

// Moved outside or ensure it's memoized if inside a component and passed as dependency
const parseAndFormatDate = (dateStr: string | undefined, displayFormat: string = 'MMM dd, yyyy'): string => {
  if (!dateStr || dateStr.trim() === '') return 'N/A';
  // Try parsing 'yyyy-MM-dd' first
  let parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
  if (!isValid(parsedDate)) {
    // Fallback for other valid date strings if direct string is valid
    parsedDate = new Date(dateStr);
  }

  if (!isValid(parsedDate)) {
    // console.warn(`Invalid date string for formatting: "${dateStr}"`);
    return dateStr; // Fallback to original string if still invalid
  }
  return formatDateFn(parsedDate, displayFormat);
};

export function InvoicePreview({ invoiceData, calculatedTotals, invoiceElementId }: InvoicePreviewProps) {
  const {
    invoiceNumber,
    issueDate: issueDateString,
    dueDate: dueDateString,
    from,
    billTo,
    items,
    notes,
    termsAndConditions,
    paymentInstructions,
    currency,
    discountRate,
    taxRate,
    shipping,
    logoDataUrl,
  } = invoiceData;

  const { subtotal, discountAmount, taxAmount, total } = calculatedTotals;

  const [formattedIssueDate, setFormattedIssueDate] = useState('---');
  const [formattedDueDate, setFormattedDueDate] = useState('---');

  useEffect(() => {
    setFormattedIssueDate(parseAndFormatDate(issueDateString));
    // Only format due date if it's provided
    if (dueDateString && dueDateString.trim() !== '') {
      setFormattedDueDate(parseAndFormatDate(dueDateString));
    } else {
      setFormattedDueDate('N/A'); // Or an empty string, consistent with how you want to display it
    }
  }, [issueDateString, dueDateString]);


  return (
    <div 
      id={invoiceElementId} 
      className={cn(
        "invoice-preview bg-white text-black font-sans text-sm",
        // A4 formatting is handled in globals.css
      )}
    >
      {/* Header */}
      <div className="flex flex-row justify-between items-start mb-10">
        <div className="mb-0">
          {logoDataUrl ? (
            <Image 
              src={logoDataUrl}
              alt="Company Logo" 
              width={150} 
              height={50}
              className="mb-4 object-contain max-h-[60px]"
              data-ai-hint="company logo"
            />
          ) : (
            <Image 
              src="https://placehold.co/150x50.png"
              alt="Company Logo Placeholder" 
              width={150} 
              height={50}
              data-ai-hint="company logo placeholder"
              className="mb-4"
            />
          )}
          <h1 className="text-3xl font-bold mb-1">INVOICE</h1>
          <p className="text-sm text-[var(--color-gold-dark)]">Invoice #: {invoiceNumber || '---'}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg mb-1">{from.name || 'Your Company Name'}</p>
          <p className="text-sm text-[var(--color-gold-darkest)]">{from.address || 'Your Company Address'}</p>
          {from.email && <p className="text-sm text-[var(--color-gold-darkest)]">{from.email}</p>}
          {from.phone && <p className="text-sm text-[var(--color-gold-darkest)]">{from.phone}</p>}
        </div>
      </div>

      {/* Bill To and Dates */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-sm font-semibold uppercase text-[var(--color-gold-dark)] mb-2">Bill To</h2>
          <p className="font-medium text-base mb-1">{billTo.name || 'Client Name'}</p>
          <p className="text-sm text-[var(--color-gold-darkest)]">{billTo.address || 'Client Address'}</p>
          {billTo.email && <p className="text-sm text-[var(--color-gold-darkest)]">{billTo.email}</p>}
          {billTo.phone && <p className="text-sm text-[var(--color-gold-darkest)]">{billTo.phone}</p>}
        </div>
        <div className="text-right">
          <div className="mb-3">
            <p className="text-sm font-semibold uppercase text-muted-foreground mb-1">Issue Date</p>
            <p className="text-base">{formattedIssueDate}</p>
          </div>
          {/* Conditional rendering based on whether dueDateString was originally provided and valid */}
          {(dueDateString && dueDateString.trim() !== '' && formattedDueDate !== 'N/A') && (
            <div>
              <p className="text-sm font-semibold uppercase text-muted-foreground mb-1">Due Date</p>
              <p className="text-base">{formattedDueDate}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-10 overflow-hidden w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-3 font-semibold text-sm border-b border-gray-200" style={{ width: '50%' }}>Description</th>
              <th className="p-3 font-semibold text-sm text-right border-b border-gray-200" style={{ width: '15%' }}>Quantity</th>
              <th className="p-3 font-semibold text-sm text-right border-b border-gray-200" style={{ width: '15%' }}>Unit Price</th>
              <th className="p-3 font-semibold text-sm text-right border-b border-gray-200" style={{ width: '20%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(items && items.length > 0 && items.some(item => item.description || (item.quantity && item.unitPrice) || (item.quantity > 0 && item.unitPrice > 0) )) ? ( 
                items.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--color-gold-light)]">
                    <td className="p-3 text-sm">{item.description}</td>
                    <td className="p-3 text-sm text-right">{item.quantity}</td>
                    <td className="p-3 text-sm text-right">{formatCurrency(item.unitPrice, currency)}</td>
                    <td className="p-3 text-sm text-right">{formatCurrency(calculateItemTotal(item), currency)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-sm text-center text-muted-foreground">No items added.</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-10">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-gold-darkest)]">Subtotal:</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          {(discountRate || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-gold-darkest)]">Discount ({discountRate || 0}%):</span>
              <span>- {formatCurrency(discountAmount, currency)}</span>
            </div>
          )}
          {(taxRate || 0) > 0 && (
             <div className="flex justify-between text-sm">
              <span className="text-[var(--color-gold-darkest)]">Tax ({taxRate || 0}%):</span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>
          )}
          {(shipping || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-gold-darkest)]">Shipping:</span>
              <span>{formatCurrency(shipping || 0, currency)}</span>
            </div>
          )}
          <Separator className="my-3" />
          <div className="flex justify-between font-bold text-lg pt-1">
            <span>Total:</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes, Terms & Conditions, Payment Instructions */}
      {notes && notes.trim() !== '' && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase text-[var(--color-gold-dark)] mb-2">Notes</h3>
          <p className="text-sm text-[var(--color-gold-darkest)] whitespace-pre-line">{notes}</p>
        </div>
      )}
      {termsAndConditions && termsAndConditions.trim() !== '' && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase text-[var(--color-gold-dark)] mb-2">Terms &amp; Conditions</h3>
          <p className="text-sm text-[var(--color-gold-darkest)] whitespace-pre-line">{termsAndConditions}</p>
        </div>
      )}
      {paymentInstructions && paymentInstructions.trim() !== '' && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold uppercase text-[var(--color-gold-dark)] mb-2">Payment Instructions</h3>
          <p className="text-sm text-[var(--color-gold-darkest)] whitespace-pre-line">{paymentInstructions}</p>
        </div>
      )}


      {/* Footer */}
      <div className="text-center text-sm text-[var(--color-gold-dark)] pt-6 border-t border-[var(--color-gold-light)] mt-auto">
        <p className="mb-1">Thank you for your business!</p>
        {(from.name || from.email || from.phone) && (
            <p>If you have any questions concerning this invoice, please contact {from.name || 'Us'}
            {from.email && ` at ${from.email}`}
            {(!from.email && from.phone) && ` at ${from.phone}`}.
            </p>
        )}
      </div>
    </div>
  );
}

