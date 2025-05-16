
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelpCircle, BookOpen, MessageSquare, Send, LifeBuoy } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center">
          <HelpCircle className="mr-3 h-8 w-8" /> Help & Support
        </h1>
        <p className="text-muted-foreground mt-1">Find answers to your questions, access documentation, or contact our support team.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BookOpen className="mr-3 h-6 w-6 text-primary" />
              Knowledge Base
            </CardTitle>
            <CardDescription>Browse our comprehensive documentation and user guides.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Learn how to use all features of Sarvagyna Billing, from creating your first invoice to managing advanced settings.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="#">Go to Documentation (Soon)</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MessageSquare className="mr-3 h-6 w-6 text-primary" />
              FAQs
            </CardTitle>
            <CardDescription>Find quick answers to common questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Check our FAQ section for solutions to common issues, troubleshooting tips, and best practices.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="#">View FAQs (Soon)</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center text-xl">
                <LifeBuoy className="mr-3 h-6 w-6 text-primary" />
                Contact Support
            </CardTitle>
          <CardDescription>Can't find an answer? Reach out to our support team directly by filling out the form below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="supportName">Your Name</Label>
              <Input id="supportName" type="text" placeholder="e.g., Jane Doe" />
            </div>
            <div>
              <Label htmlFor="supportEmail">Your Email</Label>
              <Input id="supportEmail" type="email" placeholder="e.g., jane.doe@example.com" />
            </div>
            <div>
              <Label htmlFor="supportSubject">Subject</Label>
              <Input id="supportSubject" type="text" placeholder="e.g., Issue with PDF export" />
            </div>
            <div>
              <Label htmlFor="supportMessage">Your Message</Label>
              <Textarea id="supportMessage" placeholder="Please describe your issue or question in detail..." rows={5} />
            </div>
            <div className="flex justify-end">
                <Button type="submit">
                <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Support features are currently placeholders. Contact form submission is not yet active.
      </p>
    </div>
  );
}
