import type { Control, UseFieldArrayReturn, FieldErrors } from 'react-hook-form';
import type { InvoiceFormValues, InvoiceItem } from '@/types/invoice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Trash2 } from 'lucide-react';
import { calculateItemTotal, formatCurrency } from '@/lib/invoice-utils';
import { cn } from '@/lib/utils';

interface InvoiceItemRowProps {
  index: number;
  control: Control<InvoiceFormValues>;
  remove: UseFieldArrayReturn<InvoiceFormValues, "items">['remove'];
  currency: string;
  errors: FieldErrors<InvoiceFormValues>;
  itemValue: InvoiceItem; // Pass the current item value for total calculation display
}

export function InvoiceItemRow({ index, control, remove, currency, errors, itemValue }: InvoiceItemRowProps) {
  const itemTotal = calculateItemTotal(itemValue);
  const itemErrors = errors.items?.[index];

  return (
    <div className="grid grid-cols-12 gap-2 items-start py-2 border-b last:border-b-0">
      <div className="col-span-12 sm:col-span-5">
        <FormField
          control={control}
          name={`items.${index}.description`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Item description" {...field} className={cn(itemErrors?.description && "border-destructive")}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="col-span-4 sm:col-span-2">
        <FormField
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="number" placeholder="Qty" {...field} className={cn("text-right", itemErrors?.quantity && "border-destructive")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="col-span-4 sm:col-span-2">
        <FormField
          control={control}
          name={`items.${index}.unitPrice`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="number" placeholder="Price" {...field} className={cn("text-right", itemErrors?.unitPrice && "border-destructive")} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="col-span-4 sm:col-span-2 flex items-center justify-end pt-2">
        <span className="font-medium text-sm">{formatCurrency(itemTotal, currency)}</span>
      </div>
      <div className="col-span-12 sm:col-span-1 flex items-center justify-end pt-1 sm:pt-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          aria-label="Remove item"
          className="text-destructive hover:text-destructive/80"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
