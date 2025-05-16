
import type { UseFormReturn, Path } from 'react-hook-form';
import type { InvoiceFormValues, ClientAddress } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AddressInputGroupProps {
  form: UseFormReturn<InvoiceFormValues>;
  title: string;
  fieldNamePrefix: Path<InvoiceFormValues>; 
  isFromSection?: boolean; // To conditionally render logo uploader
}

export function AddressInputGroup({ form, title, fieldNamePrefix, isFromSection = false }: AddressInputGroupProps) {
  const namePath = (field: keyof ClientAddress) => `${fieldNamePrefix}.${field}` as Path<InvoiceFormValues>;

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('logoDataUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('logoDataUrl', undefined);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFromSection && (
          <FormItem>
            <FormLabel>Company Logo</FormLabel>
            <FormControl>
              <Input 
                type="file" 
                accept="image/png, image/jpeg, image/svg+xml" 
                onChange={handleLogoChange} 
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        <FormField
          control={form.control}
          name={namePath('name')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Company or Individual Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={namePath('address')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Street Address, City, State, Zip" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={namePath('email')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Optional)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={namePath('phone')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+91 9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
