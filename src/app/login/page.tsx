
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardFooter, // Not used, can be removed if no footer specific to card
  // CardHeader, // Not used, can be removed if no header specific to card
  // CardTitle, // Not used, title is above card
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, KeyRound } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('isUserLoggedIn', 'true');
      toast({
        title: "Logged In",
        description: "Successfully logged in as admin.",
      });
      router.push('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg px-4">
      {/* Removed placeholder image */}
      <div className="grid gap-2 text-center w-[350px]">
        <h1 className="text-3xl font-bold text-primary">Login</h1>
        <p className="text-balance text-muted-foreground">
          Enter your username and password below to login
        </p>
      </div>
      <Card className="shadow-xl w-full max-w-sm">
        <CardContent className="grid gap-4 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="admin"
                className="pl-8"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="#" 
                className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type="password" 
                placeholder="Your password"
                className="pl-8"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Button type="button" className="w-full mt-2" onClick={handleLogin}>
            Login
          </Button>
        </CardContent>
      </Card>
      {/* Placeholder for signup if needed in future can be removed if not used */}
      {/* <div className="mt-4 text-center text-sm"></div> */}
    </div>
  );
}
