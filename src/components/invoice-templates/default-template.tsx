"use client";

import React from 'react';
import Image from 'next/image';

interface DefaultTemplateProps {
  companyName?: string;
  companyAddress?: string;
  companyLogo?: string;
  
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  
  clientName?: string;
  clientAddress?: string;
  
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  
  termsAndConditions?: string;
}

export function DefaultTemplate({
  companyName = "Your Company Name",
  companyAddress = "Your Company Address",
  companyLogo = "https://placehold.co/150x50.png",
  
  invoiceNumber = "INV-202505-0001",
  issueDate = "May 18, 2025",
  dueDate = "Jun 17, 2025",
  
  clientName = "Client Name",
  clientAddress = "Client Address",
  
  items = [],
  
  termsAndConditions = `- All services are subject to a 50% advance payment before project initiation.
- Final deliverables will be provided after full payment is received.
- Revisions are limited to 2 rounds unless otherwise specified.
- Turnaround time may vary based on the scope of work and will be communicated in advance.
- CreatorNex reserves the right to showcase completed work for portfolio and marketing purposes unless stated otherwise by the client.
- Urgent delivery may incur additional charges.
- Cancellations after work has begun are non-refundable.`
}: DefaultTemplateProps) {
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const total = subtotal;

  return (
    <div id="invoice-to-export" className="invoice-preview bg-white text-black font-sans text-sm">
      {/* Header */}
      <div className="flex flex-row justify-between items-start mb-10">
        <div className="mb-0">
          <Image 
            alt="Company Logo" 
            src={companyLogo} 
            width={150} 
            height={50} 
            className="mb-4" 
          />
          <h1 className="text-3xl font-bold mb-1">INVOICE</h1>
          <p className="text-sm text-[var(--color-gold-dark)]">Invoice #: {invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg mb-1">{companyName}</p>
          <p className="text-sm text-[var(--color-gold-darkest)]">{companyAddress}</p>
        </div>
      </div>

      {/* Client and Date Info */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-sm font-semibold uppercase text-[var(--color-gold-dark)] mb-2">Bill To</h2>
          <p className="font-medium text-base mb-1">{clientName}</p>
          <p className="text-sm text-[var(--color-gold-darkest)]">{clientAddress}</p>
        </div>
        <div className="text-right">
          <div className="mb-3">
            <p className="text-sm font-semibold uppercase text-muted-foreground mb-1">Issue Date</p>
            <p className="text-base">{issueDate}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-muted-foreground mb-1">Due Date</p>
            <p className="text-base">{dueDate}</p>
          </div>
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
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-3 text-sm text-center text-muted-foreground">
                  No items added.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index}>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="p-3 text-right">₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-gold-darkest)]">Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full my-3"></div>
          <div className="flex justify-between font-bold text-lg pt-1">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold uppercase text-[var(--color-gold-dark)] mb-2">
          Terms &amp; Conditions
        </h3>
        <p className="text-sm text-[var(--color-gold-darkest)] whitespace-pre-line">
          {termsAndConditions}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-[var(--color-gold-dark)] pt-6 border-t border-[var(--color-gold-light)] mt-auto">
        <p className="mb-1">Thank you for your business!</p>
      </div>
    </div>
  );
} 