"use client";

import React from 'react';

interface InvoiceItem {
  description: string;
  price: number;
  qty: number;
  subtotal: number;
}

export function CreativeProfessionalInvoice() {
  // Fixed company information
  const companyName = "Salford & Co.";
  const companyAddress = "123 Anywhere St., Any City, ST 12345";
  const companyPhone = "+123-456-7890";
  const companyWebsite = "www.reallygreatsite.com";

  // Fixed invoice information
  const invoiceNumber = "#123456";
  const dueDate = "12 October, 2024";
  const invoiceDate = "15 October, 2024";

  // Fixed client information
  const clientName = "Hannah Morales";
  const clientTitle = "Managing Director, Salford & Co.";
  const clientAddress = "123 Anywhere St., Any City, ST 12345";
  const clientPhone = "+123-456-7890";
  const clientEmail = "hello@reallygreatsite.com";

  // Fixed payment method
  const paymentMethod = {
    accountNo: "123-456-7890",
    accountName: "Hannah Morales",
    branchName: "Salford & Co."
  };

  // Fixed invoice items
  const items: InvoiceItem[] = [
    { description: "Brand Consultation", price: 100, qty: 1, subtotal: 100 },
    { description: "Logo Design", price: 100, qty: 1, subtotal: 100 },
    { description: "Website Design", price: 100, qty: 1, subtotal: 100 },
    { description: "Social Media Template", price: 100, qty: 1, subtotal: 100 },
    { description: "Flyer", price: 50, qty: 6, subtotal: 300 }
  ];

  // Fixed financial calculations
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = 0;
  const taxRate = 10;
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = subtotal - discount + taxAmount;

  // Fixed terms and signature
  const termsAndConditions = "Please send payment within 30 days of receiving this invoice. There will be a 10% interest charge per month on late invoice.";
  const adminName = "Marceline Anderson";
  const adminTitle = "Administrator";

  // Fixed colors
  const primaryColor = "#192A56"; // Navy blue
  const accentColor = "#FACC15"; // Yellow

  // Default logo
  const DefaultLogo = () => (
    <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15L20 70H80L50 15Z" fill={accentColor} />
      <path d="M40 35L25 65H55L40 35Z" fill={accentColor} />
    </svg>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Section with Logo and Title */}
      <div className="relative">
        {/* Yellow corner accent */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-20 rounded-bl-full" 
          style={{ backgroundColor: accentColor }}
        />
        
        {/* Main Header */}
        <div className="py-8 px-8 text-white" style={{ backgroundColor: primaryColor }}>
          <div className="flex justify-between items-start">
            {/* Company Logo & Name */}
            <div className="flex flex-col items-start">
              <div className="mb-2">
                <DefaultLogo />
              </div>
              <h1 className="text-2xl font-bold">{companyName}</h1>
              
              {/* Client Info */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-300">Invoice To:</p>
                <h2 className="text-xl font-bold">{clientName}</h2>
                <p className="text-sm">{clientTitle}</p>
              </div>
            </div>
            
            {/* Invoice Info */}
            <div className="text-right">
              <h1 className="text-5xl font-bold" style={{ color: accentColor }}>INVOICE</h1>
              <div className="mt-6 text-sm">
                <div className="flex justify-end mt-2">
                  <span className="w-24 font-medium">Invoice No:</span>
                  <span className="w-32 text-right">{invoiceNumber}</span>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="w-24 font-medium">Due Date:</span>
                  <span className="w-32 text-right">{dueDate}</span>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="w-24 font-medium">Invoice Date:</span>
                  <span className="w-32 text-right">{invoiceDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Accent Address Bar */}
        <div className="py-4 px-8 relative" style={{ backgroundColor: accentColor }}>
          <div className="flex items-center">
            <div className="rounded-full p-2 mr-2" style={{ backgroundColor: primaryColor }}>
              <svg 
                className="w-4 h-4" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                style={{ color: accentColor }}
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
            </div>
            <span style={{ color: primaryColor }} className="font-medium">{clientAddress}</span>
          </div>
          
          {/* Diagonal Stripes */}
          <div className="absolute right-8 top-0 h-full flex items-center">
            <div 
              className="w-3 h-full transform -skew-x-12 mr-3" 
              style={{ backgroundColor: primaryColor }}
            ></div>
            <div 
              className="w-3 h-full transform -skew-x-12" 
              style={{ backgroundColor: primaryColor }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Contact and Payment Method */}
      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Contact Info */}
        <div>
          <div className="mb-2">
            <span className="font-medium">Phone:</span>
            <span className="ml-4">{clientPhone}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Email:</span>
            <span className="ml-4">{clientEmail}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Address:</span>
            <span className="ml-4">{clientAddress}</span>
          </div>
        </div>
        
        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>PAYMENT METHOD</h3>
          <div className="mb-2">
            <span className="font-medium">Account No:</span>
            <span className="ml-4">{paymentMethod.accountNo}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Account Name:</span>
            <span className="ml-4">{paymentMethod.accountName}</span>
          </div>
          <div className="mb-2">
            <span className="font-medium">Branch Name:</span>
            <span className="ml-4">{paymentMethod.branchName}</span>
          </div>
        </div>
      </div>
      
      {/* Invoice Items Table */}
      <div className="px-8 pb-8">
        {/* Table Header */}
        <div 
          className="grid grid-cols-4 text-white font-bold py-3 px-4 rounded-t-lg" 
          style={{ backgroundColor: primaryColor }}
        >
          <div>DESCRIPTION</div>
          <div className="text-right">SUBTOTAL</div>
          <div className="text-right">QTY</div>
          <div className="text-right">SUBTOTAL</div>
        </div>
        
        {/* Table Body */}
        <div className="border-x border-gray-200">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="grid grid-cols-4 py-3 px-4 border-b border-gray-200"
            >
              <div>{item.description}</div>
              <div className="text-right">${item.price.toFixed(2)}</div>
              <div className="text-right">{item.qty}</div>
              <div className="text-right">${item.subtotal.toFixed(2)}</div>
            </div>
          ))}
        </div>
        
        {/* Totals Section */}
        <div className="flex justify-end mt-4">
          <div className="w-1/2">
            {/* Terms and Conditions */}
            <div>
              <h3 className="font-bold mb-2" style={{ color: primaryColor }}>TERM AND CONDITIONS</h3>
              <p className="text-sm">{termsAndConditions}</p>
              <p className="font-bold mt-4">THANK YOU FOR YOUR BUSINESS</p>
              
              {/* Contact Info Icons */}
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <div className="rounded-full p-1 mr-2" style={{ backgroundColor: accentColor }}>
                    <svg 
                      className="w-4 h-4" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      style={{ color: primaryColor }}
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-sm">{companyPhone}</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="rounded-full p-1 mr-2" style={{ backgroundColor: accentColor }}>
                    <svg 
                      className="w-4 h-4" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      style={{ color: primaryColor }}
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-sm">{companyWebsite}</span>
                </div>
                <div className="flex items-center">
                  <div className="rounded-full p-1 mr-2" style={{ backgroundColor: accentColor }}>
                    <svg 
                      className="w-4 h-4" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      style={{ color: primaryColor }}
                    >
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">{companyAddress}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-1/3">
            <div className="flex justify-between mb-2">
              <span>Sub-total:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Discount:</span>
              <span>${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax ({taxRate}%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div 
              className="flex justify-between text-white font-bold py-2 px-4 mt-2"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            {/* Signature */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center">
              <div className="mb-1">{adminName}</div>
              <div className="text-sm text-gray-600">{adminTitle}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Bar */}
      <div className="h-16 relative" style={{ backgroundColor: accentColor }}>
        {/* Diagonal Stripes */}
        <div className="absolute left-8 top-0 h-full flex items-center transform -translate-x-full">
          <div 
            className="w-3 h-full transform skew-x-12 mr-3"
            style={{ backgroundColor: primaryColor }}
          ></div>
          <div 
            className="w-3 h-full transform skew-x-12"
            style={{ backgroundColor: primaryColor }}
          ></div>
        </div>
      </div>
    </div>
  );
} 