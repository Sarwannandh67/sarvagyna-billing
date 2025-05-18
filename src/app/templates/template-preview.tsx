"use client";

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Palette, 
  TextCursorInput, 
  LayoutTemplate, 
  Paintbrush, 
  Save 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface TemplateCustomizationProps {
  templateId: string;
  onSave?: (customization: {
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    logoEnabled: boolean;
    fontSize: string;
  }) => void;
}

type ColorPalette = {
  [key: string]: string[];
}

const colorPalettes: ColorPalette = {
  'classic-professional': ['#2C3E50', '#34495E', '#ECF0F1', '#BDC3C7'],
  'elegant-minimalist': ['#000000', '#6C757D', '#F8F9FA', '#DEE2E6'],
  'creative-professional': ['#192A56', '#FACC15', '#FFFFFF', '#000000'],
  'modern-minimalist': ['#2C3333', '#395B64', '#A5C9CA', '#E7F6F2'],
  'creative-bold': ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E'],
  'corporate-elegant': ['#2D4059', '#EA5455', '#F07B3F', '#FFD460'],
  'startup-fresh': ['#6A5ACD', '#7ED7C1', '#CBE896', '#F3D250'],
  'freelancer-simple': ['#3D5A80', '#98C1D9', '#E0FBFC', '#293241']
};

export function TemplatePreview({ 
  templateId, 
  onSave 
}: TemplateCustomizationProps) {
  const templateColors = colorPalettes[templateId] || ['#000000', '#666666', '#FFFFFF', '#333333'];

  const [primaryColor, setPrimaryColor] = useState(templateColors[0]);
  const [secondaryColor, setSecondaryColor] = useState(templateColors[1]);
  const [companyName, setCompanyName] = useState('');
  const [logoEnabled, setLogoEnabled] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  const handleColorChange = (color: string, type: 'primary' | 'secondary') => {
    if (type === 'primary') {
      setPrimaryColor(color);
    } else {
      setSecondaryColor(color);
    }
  };

  const handleSaveTemplate = () => {
    const customization = {
      primaryColor,
      secondaryColor,
      companyName,
      logoEnabled,
      fontSize
    };

    // Call the onSave prop if provided
    if (onSave) {
      onSave(customization);
    }

    // Optional: Add a toast or notification
    console.log('Template customization saved', customization);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <LayoutTemplate className="mr-3 h-6 w-6" />
          Template Customization
        </CardTitle>
        <CardDescription>
          Personalize your invoice template to match your brand identity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">
              <Palette className="mr-2 h-4 w-4" /> Colors
            </TabsTrigger>
            <TabsTrigger value="branding">
              <TextCursorInput className="mr-2 h-4 w-4" /> Branding
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Paintbrush className="mr-2 h-4 w-4" /> Layout
            </TabsTrigger>
          </TabsList>
          
          {/* Colors Tab */}
          <TabsContent value="colors">
            <div className="space-y-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex space-x-2 mt-2">
                  {templateColors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color, 'primary')}
                      className={`w-10 h-10 rounded-full ${
                        primaryColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex space-x-2 mt-2">
                  {templateColors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color, 'secondary')}
                      className={`w-10 h-10 rounded-full ${
                        secondaryColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Branding Tab */}
          <TabsContent value="branding">
            <div className="space-y-4">
              <div>
                <Label>Company Name</Label>
                <Input 
                  placeholder="Enter your company name" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="logo-toggle"
                  checked={logoEnabled}
                  onCheckedChange={setLogoEnabled}
                />
                <Label htmlFor="logo-toggle">Enable Logo</Label>
              </div>
            </div>
          </TabsContent>
          
          {/* Layout Tab */}
          <TabsContent value="layout">
            <div className="space-y-4">
              <div>
                <Label>Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full mt-6" 
          onClick={handleSaveTemplate}
        >
          <Save className="mr-2 h-4 w-4" /> Save Template Customization
        </Button>
      </CardContent>
    </Card>
  );
} 