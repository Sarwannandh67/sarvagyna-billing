
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, CheckCircle, Eye } from "lucide-react";
import Image from "next/image";
// import { useToast } from "@/hooks/use-toast"; // Potentially for "Template selected" toast

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  dataAiHint: string;
}

const availableTemplates: InvoiceTemplate[] = [
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    description: 'A timeless and clean design suitable for all types of businesses. Emphasizes clarity and readability.',
    imageUrl: 'https://placehold.co/300x420.png', // Replace with actual template image path or URL
    dataAiHint: 'invoice template'
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Sleek and contemporary, this template focuses on essential information with a minimalist aesthetic.',
    imageUrl: 'https://placehold.co/300x420.png', // Replace with actual template image path or URL
    dataAiHint: 'modern invoice'
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    description: 'A vibrant design with a touch of color, perfect for creative agencies and freelancers who want to stand out.',
    imageUrl: 'https://placehold.co/300x420.png', // Replace with actual template image path or URL
    dataAiHint: 'creative invoice'
  },
];

export default function TemplatesPage() {
  // const { toast } = useToast();
  // TODO: Implement state for activeTemplateId, load from localStorage/settings
  const activeTemplateId = 'classic-professional'; // Example: Set a default active template

  // const handleSelectTemplate = (templateId: string) => {
  //   // TODO: Save selected template to localStorage/settings
  //   // setActiveTemplateId(templateId);
  //   toast({
  //     title: "Template Selected",
  //     description: `"${availableTemplates.find(t => t.id === templateId)?.name}" is now your active invoice template.`,
  //   });
  // };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center">
          <LayoutGrid className="mr-3 h-8 w-8" /> Invoice Templates
        </h1>
        <p className="text-muted-foreground mt-1">Choose and customize invoice templates to match your brand.</p>
      </header>

      {availableTemplates.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="p-6 text-center text-muted-foreground">
            <LayoutGrid className="mx-auto h-12 w-12 mb-4 text-primary/50" />
            <p className="mb-2">No invoice templates are currently available.</p>
            <p className="text-sm">Please check back later or contact support if you believe this is an error.</p>
             <Button variant="outline" className="mt-4" disabled>Add New Template (Soon)</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`shadow-md hover:shadow-lg transition-shadow flex flex-col ${template.id === activeTemplateId ? "border-2 border-primary ring-2 ring-primary/30" : "border-border"}`}
            >
              <CardHeader className="p-0">
                <div className="relative w-full aspect-[3/4.2] rounded-t-md overflow-hidden group"> {/* A4-like aspect ratio for preview */}
                  <Image 
                    src={template.imageUrl} 
                    alt={template.name} 
                    layout="fill" 
                    objectFit="cover" 
                    data-ai-hint={template.dataAiHint}
                  />
                  {template.id === activeTemplateId && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="outline" size="sm" className="bg-background/80 hover:bg-background" disabled> {/* Preview disabled for now */}
                          <Eye className="mr-2 h-4 w-4" /> Preview
                      </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-grow">
                <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                <CardDescription className="text-sm mb-3 flex-grow">{template.description}</CardDescription>
                {template.id === activeTemplateId ? (
                  <Button disabled className="w-full mt-auto">
                      <CheckCircle className="mr-2 h-4 w-4" /> Currently Active
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="w-full mt-auto"
                    // onClick={() => handleSelectTemplate(template.id)} // Enable when selection logic is implemented
                    disabled // Selection disabled for now
                  >
                    Select Template
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
       <p className="text-xs text-muted-foreground mt-4 text-center">
        Template selection and customization options will be implemented soon.
      </p>
    </div>
  );
}

    