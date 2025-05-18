"use client";

import React from 'react';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '@/lib/invoice-utils';

interface ClassicProfessionalInvoiceProps {
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  clientName?: string;
  clientAddress?: string;
  sellerInfo?: {
    name: string;
    address: string;
    contact?: string;
  };
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount?: number;
  currency?: string;
  status?: 'Paid' | 'Unpaid' | 'Pending';
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export function ClassicProfessionalInvoice({
  invoiceNumber = 'INV-12345',
  issueDate = new Date().toISOString(),
  dueDate,
  clientName = 'John Doe',
  clientAddress = '123 Client Street, City, Country',
  sellerInfo = {
    name: 'Your Company Name',
    address: '456 Business Avenue, City, Country',
    contact: '+1 (555) 123-4567'
  },
  items = [
    { description: 'Product/Service 1', quantity: 2, unitPrice: 100 },
    { description: 'Product/Service 2', quantity: 1, unitPrice: 200 }
  ],
  totalAmount,
  currency = 'USD',
  status = 'Pending',
  colors = {
    primary: '#2563eb',
    secondary: '#60a5fa',
    background: '#ffffff',
    text: '#000000'
  }
}: ClassicProfessionalInvoiceProps) {
  // Calculate total if not provided
  const calculatedTotal = totalAmount || 
    items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Format dates
  const formattedIssueDate = format(parseISO(issueDate), 'MMM dd, yyyy');
  const formattedDueDate = dueDate ? format(parseISO(dueDate), 'MMM dd, yyyy') : 'N/A';

  return (
    <div 
      className="invoice-container p-8 max-w-2xl mx-auto" 
      style={{ 
        backgroundColor: colors.background, 
        color: colors.text,
        fontFamily: 'Arial, sans-serif'
      }}
    >
      {/* Header */}
      <div className="invoice-header flex justify-between items-start mb-8">
        <div>
          <h1 
            className="text-3xl font-bold" 
            style={{ color: colors.primary }}
          >
            {sellerInfo.name}
          </h1>
          <p className="text-sm">{sellerInfo.address}</p>
          {sellerInfo.contact && <p className="text-sm">{sellerInfo.contact}</p>}
        </div>
        <div className="invoice-details text-right">
          <h2 
            className="text-2xl font-bold mb-2" 
            style={{ color: colors.primary }}
          >
            INVOICE
          </h2>
          <p>Invoice No: {invoiceNumber}</p>
          <p>Issue Date: {formattedIssueDate}</p>
          <p>Due Date: {formattedDueDate}</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="bill-to mb-8">
        <h3 
          className="text-lg font-semibold mb-2" 
          style={{ color: colors.secondary }}
        >
          BILL TO:
        </h3>
        <p>{clientName}</p>
        <p>{clientAddress}</p>
      </div>

      {/* Invoice Items */}
      <table className="w-full mb-8" style={{ borderColor: colors.secondary }}>
        <thead>
          <tr 
            className="border-b" 
            style={{ borderBottomColor: colors.secondary }}
          >
            <th 
              className="py-2 text-left" 
              style={{ color: colors.secondary }}
            >
              Description
            </th>
            <th 
              className="py-2 text-right" 
              style={{ color: colors.secondary }}
            >
              Quantity
            </th>
            <th 
              className="py-2 text-right" 
              style={{ color: colors.secondary }}
            >
              Unit Price
            </th>
            <th 
              className="py-2 text-right" 
              style={{ color: colors.secondary }}
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr 
              key={index} 
              className="border-b" 
              style={{ borderBottomColor: colors.secondary }}
            >
              <td className="py-2">{item.description}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(item.unitPrice, currency)}</td>
              <td className="py-2 text-right">{formatCurrency(item.quantity * item.unitPrice, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Invoice Summary */}
      <div className="invoice-summary mb-8">
        <div 
          className="flex justify-between font-bold text-lg" 
          style={{ color: colors.primary }}
        >
          <span>Total</span>
          <span>{formatCurrency(calculatedTotal, currency)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Status</span>
          <span 
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              status === "Paid" ? "bg-green-100 text-green-700" :
              status === "Pending" ? "bg-orange-100 text-orange-700" :
              "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="invoice-footer text-center mt-8">
        <p 
          className="text-sm" 
          style={{ color: colors.secondary }}
        >
          Thank you for your business!
        </p>
      </div>
    </div>
  );
} 