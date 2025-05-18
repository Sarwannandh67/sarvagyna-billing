                "use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutGrid, CheckCircle, Eye, Settings, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { TemplatePreview } from "./template-preview";
import { ElegantMinimalistInvoice } from "@/components/invoice-templates/elegant-minimalist";
import { ClassicProfessionalInvoice } from "@/components/invoice-templates/classic-professional";
import { CreativeProfessionalInvoice } from "@/components/invoice-templates/creative-professional";
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
    imageUrl: '/template-1.png',
    dataAiHint: 'invoice template'
  },
  {
    id: 'elegant-minimalist',
    name: 'Elegant Minimalist',
    description: 'A refined, typography-focused design with clean lines and a sophisticated ampersand logo.',
    imageUrl: '/template-2.png',
    dataAiHint: 'minimalist invoice'
  },
  {
    id: 'creative-professional',
    name: 'Creative Professional',
    description: 'A vibrant and modern design with dynamic color scheme and comprehensive layout.',
    imageUrl: '/template-3.png',
    dataAiHint: 'creative invoice template'
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Sleek and contemporary, this template focuses on essential information with a minimalist aesthetic.',
    imageUrl: '/template-placeholders/modern-minimalist.png', 
    dataAiHint: 'modern invoice'
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    description: 'A vibrant design with a touch of color, perfect for creative agencies and freelancers who want to stand out.',
    imageUrl: '/template-placeholders/creative-bold.png',
    dataAiHint: 'creative invoice'
  },
  {
    id: 'corporate-elegant',
    name: 'Corporate Elegant',
    description: 'A sophisticated template designed for corporate clients, with a refined and professional look.',
    imageUrl: '/template-placeholders/corporate-elegant.png',
    dataAiHint: 'corporate invoice'
  },
  {
    id: 'startup-fresh',
    name: 'Startup Fresh',
    description: 'A modern, clean design perfect for tech startups and innovative businesses.',
    imageUrl: '/template-placeholders/startup-fresh.png',
    dataAiHint: 'startup invoice'
  },
  {
    id: 'freelancer-simple',
    name: 'Freelancer Simple',
    description: 'A straightforward, no-nonsense template ideal for freelancers and independent contractors.',
    imageUrl: '/template-placeholders/freelancer-simple.png',
    dataAiHint: 'freelance invoice'
  }
];

export default function TemplatesPage() {
  const [activeTemplateId, setActiveTemplateId] = useState('classic-professional');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('classic-professional');
  const [templateCustomization, setTemplateCustomization] = useState<{
    [key: string]: {
      primaryColor: string;
      secondaryColor: string;
      companyName: string;
      logoEnabled: boolean;
      fontSize: string;
    }
  }>({});

  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplateId(templateId);
    setSelectedTemplateId(templateId);
  };

  const handleSaveTemplateCustomization = (templateId: string, customization: {
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    logoEnabled: boolean;
    fontSize: string;
  }) => {
    setTemplateCustomization(prev => ({
      ...prev,
      [templateId]: customization
    }));
  };

  // Render preview based on selected template
  const renderTemplatePreview = () => {
    if (!selectedTemplateId) return null;

    const customization = templateCustomization[selectedTemplateId];

    // Helper function to create a coming soon overlay
    const ComingSoonOverlay = () => (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
            Coming Soon
          </h2>
          <p className="text-lg text-white/80 drop-shadow-md">
            Updates are under way
          </p>
        </div>
      </div>
    );

    switch (selectedTemplateId) {
      case 'elegant-minimalist':
        return (
          <ElegantMinimalistInvoice 
            colors={customization ? {
              primary: customization.primaryColor,
              secondary: customization.secondaryColor,
              background: '#F8F9FA',
              text: '#212529'
            } : undefined}
            sellerInfo={customization && customization.companyName ? {
              name: customization.companyName,
              address: 'Your Business Address'
            } : undefined}
          />
        );
      case 'classic-professional':
        return <ClassicProfessionalInvoice />;
      case 'creative-professional':
        return <CreativeProfessionalInvoice />;
      case 'modern-minimalist':
        return (
          <div className="p-6 bg-white rounded-lg shadow-md relative">
            <ComingSoonOverlay />
            <h2 className="text-2xl font-bold mb-4 opacity-30">Modern Minimalist Invoice</h2>
            <p className="text-gray-600 opacity-30">Preview for Modern Minimalist template coming soon.</p>
          </div>
        );
      case 'creative-bold':
        return (
          <div className="p-6 bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] text-white rounded-lg shadow-md relative">
            <ComingSoonOverlay />
            <h2 className="text-2xl font-bold mb-4 opacity-30">Creative Bold Invoice</h2>
            <p className="opacity-30">A vibrant template showcasing bold design principles.</p>
          </div>
        );
      case 'corporate-elegant':
        return (
          <div className="p-6 bg-[#2D4059] text-white rounded-lg shadow-md relative">
            <ComingSoonOverlay />
            <h2 className="text-2xl font-bold mb-4 opacity-30">Corporate Elegant Invoice</h2>
            <p className="opacity-30">Sophisticated design for professional corporate communication.</p>
          </div>
        );
      case 'startup-fresh':
        return (
          <div className="p-6 bg-[#6A5ACD] text-white rounded-lg shadow-md relative">
            <ComingSoonOverlay />
            <h2 className="text-2xl font-bold mb-4 opacity-30">Startup Fresh Invoice</h2>
            <p className="opacity-30">Modern and clean template for innovative businesses.</p>
          </div>
        );
      case 'freelancer-simple':
        return (
          <div className="p-6 bg-[#3D5A80] text-white rounded-lg shadow-md relative">
            <ComingSoonOverlay />
            <h2 className="text-2xl font-bold mb-4 opacity-30">Freelancer Simple Invoice</h2>
            <p className="opacity-30">Straightforward design for independent professionals.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // const { toast } = useToast();
  // TODO: Implement state for activeTemplateId, load from localStorage/settings
  // const activeTemplateId = 'classic-professional'; // Example: Set a default active template

  // const handleSelectTemplate = (templateId: string) => {
  //   // TODO: Save selected template to localStorage/settings
  //   // setActiveTemplateId(templateId);
  //   toast({
  //     title: "Template Selected",
  //     description: `"${availableTemplates.find(t => t.id === templateId)?.name}" is now your active invoice template.`,
  //   });
  // };

  return (
    <div className="space-y-6 relative select-none">
      {/* Overlay for Coming Soon Templates */}
      <div className="absolute inset-0 pointer-events-none z-40 backdrop-blur-md select-none">
        {['modern-minimalist', 'creative-bold', 'corporate-elegant', 'startup-fresh', 'freelancer-simple'].some(id => 
          availableTemplates.some(template => template.id === id)
        ) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center select-none">
            <div className="bg-white dark:bg-black rounded-2xl shadow-2xl max-w-md w-full p-10 text-center relative pointer-events-auto select-none">
              <h2 className="text-4xl font-extrabold text-primary mb-5 select-none cursor-default">Coming Soon</h2>
              <p className="text-lg text-muted-foreground mb-8 select-none cursor-default">
                We're working hard to bring you more invoice template options. 
                Stay tuned for exciting updates!
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline" 
                  className="px-6 py-3 pointer-events-none select-none cursor-default"
                  disabled
                >
                  Learn More
                </Button>
                <Button 
                  className="px-6 py-3 pointer-events-none select-none cursor-default"
                  disabled
                >
                  Notify Me
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <header className="select-none">
        <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center opacity-30 select-none cursor-default">
          <LayoutGrid className="mr-3 h-8 w-8" /> Invoice Templates
        </h1>
        <p className="text-muted-foreground mt-1 opacity-30 select-none cursor-default">Choose and customize invoice templates to match your brand.</p>
      </header>

      {availableTemplates.length === 0 ? (
        <Card className="shadow-md opacity-30 select-none">
          <CardContent className="p-6 text-center text-muted-foreground select-none">
            <LayoutGrid className="mx-auto h-12 w-12 mb-4 text-primary/50" />
            <p className="mb-2 select-none cursor-default">No invoice templates are currently available.</p>
            <p className="text-sm select-none cursor-default">Please check back later or contact support if you believe this is an error.</p>
             <Button variant="outline" className="mt-4 pointer-events-none select-none cursor-default" disabled>Add New Template (Soon)</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-30 select-none">
            {availableTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`shadow-md hover:shadow-lg transition-shadow flex flex-col relative select-none ${
                  template.id === activeTemplateId 
                    ? "border-2 border-primary ring-2 ring-primary/30" 
                    : "border-border"
                }`}
              >
                <CardHeader className="p-0 select-none">
                  <div className="relative w-full aspect-[3/4.2] rounded-t-md overflow-hidden group select-none">
                    <Image 
                      src={template.imageUrl} 
                      alt={template.name} 
                      layout="fill" 
                      objectFit="cover" 
                      data-ai-hint={template.dataAiHint}
                      className="opacity-30 select-none pointer-events-none"
                    />
                    {template.id === activeTemplateId && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg opacity-30 select-none">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-grow opacity-30 select-none">
                  <CardTitle className="text-lg mb-1 select-none cursor-default">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm mb-3 flex-grow select-none cursor-default">
                    {template.description}
                  </CardDescription>
                  <div className="flex space-x-2">
                    <Button 
                      variant={template.id === activeTemplateId ? "default" : "secondary"}
                      className="flex-grow pointer-events-none select-none cursor-default"
                      disabled
                    >
                      {template.id === activeTemplateId ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" /> Active
                        </>
                      ) : (
                        "Select"
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="pointer-events-none select-none cursor-default"
                      disabled
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Template Customization Panel */}
          {selectedTemplateId && (
            <div className="lg:col-span-1 space-y-6 opacity-30 select-none">
              <TemplatePreview 
                templateId={selectedTemplateId} 
                onSave={(customization) => handleSaveTemplateCustomization(selectedTemplateId, customization)}
              />

              {/* Template Preview */}
              <div className="w-full max-w-4xl mx-auto select-none">
                <CardTitle className="mb-4 select-none cursor-default">Template Preview</CardTitle>
                {renderTemplatePreview()}
              </div>
            </div>
          )}
        </div>
      )}
       <p className="text-xs text-muted-foreground mt-4 text-center opacity-30 select-none cursor-default">
        Template selection and customization options are now available.
       </p>
    </div>
  );
}

    