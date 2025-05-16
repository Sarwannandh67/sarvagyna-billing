
import type { InvoiceFormValues, InvoiceItem, CalculatedAmounts } from '@/types/invoice';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const INVOICE_COUNTER_KEY = 'sarvagynaInvoiceNumbering'; // Updated key
const INVOICE_PREFIX = 'INV-';

// Calculates and formats the next potential invoice number string.
// Does NOT update localStorage.
export const getNextInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYearMonth = `${year}${month}`;

  let nextCounterValue = 1;

  if (typeof window !== 'undefined') {
    const storedDataRaw = localStorage.getItem(INVOICE_COUNTER_KEY);
    if (storedDataRaw) {
      try {
        const storedData = JSON.parse(storedDataRaw);
        if (storedData && storedData.lastYearMonth === currentYearMonth && typeof storedData.lastCounter === 'number') {
          nextCounterValue = storedData.lastCounter + 1;
        }
      } catch (e) {
        console.error("Error parsing invoice numbering data from localStorage:", e);
        // Fallback to 1 if parsing fails
      }
    }
  }
  return `${INVOICE_PREFIX}${currentYearMonth}-${String(nextCounterValue).padStart(4, '0')}`;
};

// Commits the used invoice number's counter to localStorage.
// Parses the YYYYMM and numeric part from the full invoiceID string.
export const commitUsedInvoiceNumber = (invoiceId: string): void => {
  if (typeof window !== 'undefined' && invoiceId && invoiceId.startsWith(INVOICE_PREFIX)) {
    const parts = invoiceId.substring(INVOICE_PREFIX.length).split('-'); // Remove prefix then split
    if (parts.length === 2) {
      const yearMonth = parts[0]; // YYYYMM
      const numericPartString = parts[1]; // NNNN

      if (yearMonth && yearMonth.length === 6 && /^\d{6}$/.test(yearMonth) && numericPartString) {
        const numericPart = parseInt(numericPartString, 10);
        if (!isNaN(numericPart)) {
          const dataToStore = {
            lastYearMonth: yearMonth,
            lastCounter: numericPart,
          };
          localStorage.setItem(INVOICE_COUNTER_KEY, JSON.stringify(dataToStore));
        } else {
          console.warn(`Could not parse numeric counter from invoiceId part: ${numericPartString}`);
        }
      } else {
        console.warn(`Could not parse yearMonth or counter string from invoiceId: ${invoiceId}`);
      }
    } else {
      console.warn(`Could not split invoiceId into expected parts: ${invoiceId}`);
    }
  }
};


export const calculateItemTotal = (item: Pick<InvoiceItem, 'quantity' | 'unitPrice'>): number => {
  return (item.quantity || 0) * (item.unitPrice || 0);
};

export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  discountRate: number = 0,
  taxRate: number = 0,
  shipping: number = 0
): CalculatedAmounts => {
  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const discountAmount = subtotal * (discountRate / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount + shipping;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
  };
};

export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (error) {
    console.warn(`Failed to format currency for ${currencyCode}, falling back to default. Error: ${error}`);
    // Fallback for invalid currency codes to prevent crashes, displays code with amount
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
};

const HTML2CANVAS_CONTENT_WIDTH_PX = 794; // A4 portrait width at ~96 DPI
const HTML2CANVAS_CONTENT_HEIGHT_PX = 1123; // A4 portrait height at ~96 DPI

export const exportInvoiceToPDF = async (invoiceElementId: string, fileName: string = 'invoice.pdf'): Promise<void> => {
  const invoiceElement = document.getElementById(invoiceElementId);
  if (!invoiceElement) {
    console.error('Invoice element not found for PDF export.');
    throw new Error('Invoice element not found.');
  }

  // Store original styles to revert after capture
  const originalStyles = {
    width: invoiceElement.style.width,
    maxWidth: invoiceElement.style.maxWidth,
    boxShadow: invoiceElement.style.boxShadow,
    border: invoiceElement.style.border,
    margin: invoiceElement.style.margin, // Save original margin
    padding: invoiceElement.style.padding, // Save original padding
  };

  // Temporarily apply styles for capture
  invoiceElement.style.width = `${HTML2CANVAS_CONTENT_WIDTH_PX}px`;
  invoiceElement.style.height = `${HTML2CANVAS_CONTENT_HEIGHT_PX}px`;
  invoiceElement.style.maxWidth = 'none';
  invoiceElement.style.boxShadow = 'none';
  invoiceElement.style.border = 'none';
  invoiceElement.style.margin = '0'; // Remove margin for capture
  invoiceElement.style.padding = '20mm'; // Set padding to match A4 margins


  const canvas = await html2canvas(invoiceElement, {
    scale: 2, // Higher scale for better quality
    useCORS: true,
    logging: false,
    windowWidth: HTML2CANVAS_CONTENT_WIDTH_PX, // Ensure canvas renders at this width
  });

  // Revert styles to original
  invoiceElement.style.width = originalStyles.width;
  invoiceElement.style.maxWidth = originalStyles.maxWidth;
  invoiceElement.style.boxShadow = originalStyles.boxShadow;
  invoiceElement.style.border = originalStyles.border;
  invoiceElement.style.margin = originalStyles.margin; // Restore original margin
  invoiceElement.style.padding = originalStyles.padding; // Restore original padding


  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pdfPageWidth = pdf.internal.pageSize.getWidth();
  const pdfPageHeight = pdf.internal.pageSize.getHeight();

  // Calculate the aspect ratio of the image
  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = imgProps.width;
  const imgHeight = imgProps.height;
  
  // Calculate scale to fit within page dimensions
  const widthScale = pdfPageWidth / imgWidth;
  const heightScale = pdfPageHeight / imgHeight;
  const scale = Math.min(widthScale, heightScale); // Use the smaller scale to fit all content

  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;
  
  // Center the image on the page
  const xOffset = (pdfPageWidth - scaledWidth) / 2;
  const yOffset = (pdfPageHeight - scaledHeight) / 2;

  pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
  pdf.save(fileName);
};
