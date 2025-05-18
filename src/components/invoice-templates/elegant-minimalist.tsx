"use client";

import React from 'react';
import { format } from 'date-fns';

interface ElegantMinimalistInvoiceProps {
  invoiceNumber?: string;
  invoiceDate?: Date;
  billTo?: {
    name: string;
    address: string;
    phone?: string;
  };
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentInfo?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    payBy?: Date;
  };
  sellerInfo?: {
    name: string;
    address: string;
  };
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export function ElegantMinimalistInvoice({
  invoiceNumber = '12345',
  invoiceDate = new Date(),
  billTo = {
    name: 'Imani Olowe',
    address: '63 Ivy Road, Hawkville, GA, USA 31036',
    phone: '+123-456-7890'
  },
  items = [
    { description: 'Eggshell Camisole Top', quantity: 1, unitPrice: 123 },
    { description: 'Cuban Collar Shirt', quantity: 2, unitPrice: 127 },
    { description: 'Floral Cotton Dress', quantity: 1, unitPrice: 123 }
  ],
  paymentInfo = {
    bankName: 'Briard Bank',
    accountName: 'Samira Hadid',
    accountNumber: '123-456-7890',
    payBy: new Date('2025-07-05')
  },
  sellerInfo = {
    name: 'Samira Hadid',
    address: '123 Anywhere St., Any City, ST 12345'
  },
  colors = {
    primary: '#000000',
    secondary: '#6C757D',
    background: '#F8F9FA',
    text: '#212529'
  }
}: ElegantMinimalistInvoiceProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = 0; // Assuming 0% tax as in the original invoice
  const total = subtotal + tax;

  return (
    <div 
      className="invoice-container p-8 max-w-2xl mx-auto" 
      style={{ 
        backgroundColor: colors.background, 
        color: colors.text,
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div className="invoice-header flex justify-between items-start mb-8">
        <div className="logo">
          <h1 
            className="text-3xl font-bold" 
            style={{ color: colors.primary }}
          >
            &
          </h1>
        </div>
        <div className="invoice-details text-right">
          <h2 
            className="text-2xl font-bold mb-2" 
            style={{ color: colors.primary }}
          >
            INVOICE
          </h2>
          <p>Invoice No: {invoiceNumber}</p>
          <p>Date: {invoiceDate ? format(invoiceDate, 'dd MMMM yyyy') : 'N/A'}</p>
        </div>
      </div>

      <div className="bill-to mb-8">
        <h3 
          className="text-lg font-semibold mb-2" 
          style={{ color: colors.secondary }}
        >
          BILLED TO:
        </h3>
        <p>{billTo.name}</p>
        <p>{billTo.address}</p>
        {billTo.phone && <p>{billTo.phone}</p>}
      </div>

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
              Item
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
              <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
              <td className="py-2 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-summary mb-8">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (0%)</span>
          <span>$0.00</span>
        </div>
        <div 
          className="flex justify-between font-bold text-lg" 
          style={{ color: colors.primary }}
        >
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="payment-info mb-8">
        <h3 
          className="text-lg font-semibold mb-2" 
          style={{ color: colors.secondary }}
        >
          PAYMENT INFORMATION
        </h3>
        <p>{paymentInfo.bankName}</p>
        <p>Account Name: {paymentInfo.accountName}</p>
        <p>Account No.: {paymentInfo.accountNumber}</p>
        <p>Pay by: {paymentInfo.payBy ? format(paymentInfo.payBy, 'dd MMMM yyyy') : 'N/A'}</p>
      </div>

      <div className="thank-you text-center mb-8">
        <p 
          className="text-xl font-semibold" 
          style={{ color: colors.secondary }}
        >
          Thank you!
        </p>
      </div>

      <div className="seller-info text-center">
        <p 
          className="font-semibold" 
          style={{ color: colors.primary }}
        >
          {sellerInfo.name}
        </p>
        <p style={{ color: colors.secondary }}>{sellerInfo.address}</p>
      </div>
    </div>
  );
} 