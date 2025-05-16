
"use client"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, ShieldCheck, LogOut, Save, User, KeyRound, Moon, Sun } from "lucide-react";
import { useRouter } from 'next/navigation'; 
import { useToast } from "@/hooks/use-toast"; 
import { useState, useEffect } from 'react';

export default function AccountPage() {
  const router = useRouter(); 
  const { toast } = useToast(); 
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('isUserLoggedIn');
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    router.push('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: "Theme Changed",
      description: `Switched to ${newTheme} mode.`,
    });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center">
          <UserCircle className="mr-3 h-8 w-8" /> My Account
        </h1>
        <p className="text-muted-foreground mt-1">Manage your profile, preferences, and account security.</p>
      </header>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details. This information is private and not shown on invoices.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="https://placehold.co/150x150.png" alt="User Avatar" data-ai-hint="user avatar"/>
              <AvatarFallback>A</AvatarFallback> 
            </Avatar>
            <div className="flex-1">
                <Label htmlFor="avatarUpload" className="text-sm font-medium">Update Avatar</Label>
                <Input id="avatarUpload" type="file" className="mt-1 text-sm file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 2MB.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Admin User" /> 
            </div>
            <div>
              <Label htmlFor="usernameLogin">Username (Login)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="usernameLogin" type="text" placeholder="admin" readOnly className="bg-muted cursor-not-allowed pl-10" />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="jobTitle">Job Title (Optional)</Label>
            <Input id="jobTitle" placeholder="e.g., System Administrator" />
          </div>
          <div className="flex justify-end pt-2">
            <Button disabled> 
                <Save className="mr-2 h-4 w-4" /> Save Profile Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="themeToggle" className="text-sm font-medium">
              Theme
            </Label>
            <Button
              id="themeToggle"
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
           <p className="text-xs text-muted-foreground">
              Current theme: {theme === 'light' ? 'Light Mode' : 'Dark Mode'}. Your preference is saved in your browser.
            </p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Password & Security</CardTitle>
          <CardDescription>Manage your account password and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="currentPassword" type="password" placeholder="Enter your current password" className="pl-10" />
              </div>
            </div>
             <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="newPassword" type="password" placeholder="Enter new password" className="pl-10"/>
              </div>
            </div>
             <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="confirmNewPassword" type="password" placeholder="Confirm new password" className="pl-10"/>
              </div>
            </div>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-3">
            <Button variant="outline" className="w-full sm:w-auto" disabled> 
                <ShieldCheck className="mr-2 h-4 w-4" /> Change Password
            </Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Account management features are placeholders. Full functionality, including actual data saving and authentication, coming soon.
      </p>
    </div>
  );
}
