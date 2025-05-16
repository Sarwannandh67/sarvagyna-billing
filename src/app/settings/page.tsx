
"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, UploadCloud, RotateCcw } from "lucide-react";
import { CURRENCIES } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { INVOICE_COUNTER_KEY } from '@/lib/invoice-utils'; // Correctly import INVOICE_COUNTER_KEY

export default function SettingsPage() {
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultTaxRate, setDefaultTaxRate] = useState('');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('');

  useEffect(() => {
    // Load saved settings from localStorage
    const savedCompanyName = localStorage.getItem('companyName');
    if (savedCompanyName) setCompanyName(savedCompanyName);

    const savedCompanyAddress = localStorage.getItem('companyAddress');
    if (savedCompanyAddress) setCompanyAddress(savedCompanyAddress);
    
    const savedCompanyEmail = localStorage.getItem('companyEmail');
    if (savedCompanyEmail) setCompanyEmail(savedCompanyEmail);

    const savedCompanyPhone = localStorage.getItem('companyPhone');
    if (savedCompanyPhone) setCompanyPhone(savedCompanyPhone);

    const savedLogo = localStorage.getItem('companyLogoDataUrl');
    if (savedLogo) setLogoDataUrl(savedLogo);

    const savedSignature = localStorage.getItem('companySignatureDataUrl');
    if (savedSignature) setSignatureDataUrl(savedSignature);

    const savedCurrency = localStorage.getItem('defaultCurrency');
    if (savedCurrency) setDefaultCurrency(savedCurrency);
    else setDefaultCurrency('INR'); // Ensure INR if nothing is saved

    const savedTaxRate = localStorage.getItem('defaultTaxRate');
    if (savedTaxRate) setDefaultTaxRate(savedTaxRate);
    
    const savedPaymentTerms = localStorage.getItem('defaultPaymentTerms');
    if (savedPaymentTerms) setDefaultPaymentTerms(savedPaymentTerms);

  }, []);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoDataUrl(null);
      setLogoFile(null);
    }
  };

  const handleSignatureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSignatureDataUrl(null);
      setSignatureFile(null);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Save settings to localStorage
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('companyAddress', companyAddress);
    localStorage.setItem('companyEmail', companyEmail);
    localStorage.setItem('companyPhone', companyPhone);
    if (logoDataUrl) {
      localStorage.setItem('companyLogoDataUrl', logoDataUrl);
    } else {
      localStorage.removeItem('companyLogoDataUrl');
    }
    if (signatureDataUrl) {
      localStorage.setItem('companySignatureDataUrl', signatureDataUrl);
    } else {
      localStorage.removeItem('companySignatureDataUrl');
    }
    localStorage.setItem('defaultCurrency', defaultCurrency);
    localStorage.setItem('defaultTaxRate', defaultTaxRate);
    localStorage.setItem('defaultPaymentTerms', defaultPaymentTerms);


    toast({
      title: "Settings Saved",
      description: "Your application settings have been updated.",
    });
  };

  const handleResetInvoiceCounter = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(INVOICE_COUNTER_KEY); // Use the imported key
      toast({
        title: "Invoice Counter Reset",
        description: "The invoice number counter has been successfully reset for the current month/year.",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center">
          <SettingsIcon className="mr-3 h-8 w-8" /> Application Settings
        </h1>
        <p className="text-muted-foreground mt-1">Configure your application settings and preferences.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>This information will appear on your invoices and communications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" placeholder="Your Company LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="companyAddress">Company Address</Label>
              <Textarea id="companyAddress" placeholder="123 Business Rd, Suite 400, City, Country" rows={3} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input id="companyEmail" type="email" placeholder="contact@yourcompany.com" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input id="companyPhone" placeholder="+91 9876543210" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
                </div>
            </div>
            <div>
              <Label htmlFor="logoUpload">Company Logo</Label>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                  {logoDataUrl ? (
                    <Image src={logoDataUrl} alt="Company Logo Preview" width={80} height={80} className="object-contain" data-ai-hint="company logo" />
                  ) : (
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Input 
                  id="logoUpload" 
                  type="file" 
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={handleLogoChange}
                  className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" 
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Upload a PNG, JPG, or SVG. Max 2MB. Recommended: 300x100px.</p>
            </div>
             <div>
              <Label htmlFor="signatureUpload">Signature (Optional)</Label>
               <div className="flex items-center gap-3 mt-1">
                <div className="w-20 h-10 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                   {signatureDataUrl ? (
                    <Image src={signatureDataUrl} alt="Signature Preview" width={80} height={40} className="object-contain" data-ai-hint="signature image"/>
                  ) : (
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Input 
                  id="signatureUpload" 
                  type="file" 
                  accept="image/png, image/jpeg"
                  onChange={handleSignatureChange}
                  className="flex-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Upload an image of your signature (e.g., PNG with transparent background).</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Financial Settings</CardTitle>
            <CardDescription>Set default currency, tax rates, and payment terms for new invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                  <SelectTrigger id="defaultCurrency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                <Input id="defaultTaxRate" type="number" placeholder="0" min="0" max="100" step="0.01" value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} />
              </div>
            </div>
             <div>
                <Label htmlFor="defaultPaymentTerms">Default Payment Terms</Label>
                <Textarea id="defaultPaymentTerms" placeholder="e.g., Payment due within 30 days of invoice date." rows={3} value={defaultPaymentTerms} onChange={(e) => setDefaultPaymentTerms(e.target.value)} />
            </div>
          </CardContent>
        </Card>
        
        <Separator />

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </div>
      </form>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage application data settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-md font-medium mb-1">Invoice Numbering</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Resetting the invoice counter will cause the next generated invoice number to start from 1 for the current month and year.
              This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleResetInvoiceCounter}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Invoice Counter
            </Button>
          </div>
        </CardContent>
      </Card>

       <p className="text-xs text-muted-foreground mt-4 text-center">
        Your settings are saved in your browser's local storage.
      </p>
    </div>
  );
}
