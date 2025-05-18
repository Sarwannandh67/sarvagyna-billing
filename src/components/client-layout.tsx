"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  Users2,
  Package,
  Repeat,
  LayoutGrid,
  Settings as SettingsIcon,
  UserCircle,
  HelpCircle,
  Loader2,
  Wallet
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/", label: "Create Invoice", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: ListChecks },
  { href: "/clients", label: "Clients", icon: Users2 },
  { href: "/items", label: "Items / Services", icon: Package },
  { href: "/transactions", label: "Transactions", icon: Repeat },
  { href: "/templates", label: "Templates", icon: LayoutGrid },
  { href: "/expenses", label: "Expenses", icon: Wallet },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/account", label: "Account", icon: UserCircle },
  { href: "/help", label: "Help / Support", icon: HelpCircle },
];

function AppLogo() {
  const { state } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link
        href="/"
        className="flex items-center justify-center p-1 rounded-md hover:bg-sidebar-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        aria-label="Sarvagyna Home"
      >
        <Image
          src="/sarvagyna-logo-symbol.png"
          alt="Sarvagyna Symbol"
          width={28}
          height={28}
          priority
          className="object-contain h-7 w-7"
          data-ai-hint="logo symbol"
        />
      </Link>
    );
  }

  const logoSrc = state === 'expanded' ? "/sarvagyna-logo.png" : "/sarvagyna-logo-symbol.png";
  const altText = state === 'expanded' ? "Sarvagyna Full Logo" : "Sarvagyna Symbol";
  const width = state === 'expanded' ? 160 : 28;
  const height = state === 'expanded' ? 31 : 28; 
  
  const imgClassName = state === 'expanded' 
    ? "object-contain h-[31px] w-[160px]" 
    : "object-contain h-7 w-7";

  return (
    <Link
      href="/"
      className="flex items-center justify-center p-1 rounded-md hover:bg-sidebar-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      aria-label="Sarvagyna Home"
    >
      <Image
        src={logoSrc}
        alt={altText}
        width={width}
        height={height}
        priority
        className={imgClassName}
        data-ai-hint={state === 'expanded' ? "logo" : "logo symbol"}
      />
    </Link>
  );
}


export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // No theme saved, check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Auth check
    if (typeof window !== 'undefined') {
      const userLoggedIn = localStorage.getItem('isUserLoggedIn') === 'true';
      setIsLoggedIn(userLoggedIn);
      setIsLoadingAuth(false);

      if (!userLoggedIn && pathname !== '/login') {
        router.replace('/login');
      } else if (userLoggedIn && pathname === '/login') {
        router.replace('/dashboard');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); 

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }
  
  if (pathname === '/login') {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="py-8 px-4 flex justify-center items-center border-b">
            <Link href="/" aria-label="Sarvagyna Home">
            <Image
                src="/sarvagyna-logo.png"
                alt="Sarvagyna"
                width={200}
                height={39}
                priority
                className="object-contain h-[39px] w-[200px]"
                data-ai-hint="logo"
            />
            </Link>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          {children}
        </main>
        <footer className="w-full p-4 md:p-6 text-center text-xs text-muted-foreground border-t">
            <p>
                Sarvagyna Billing is Powered by <a href="https://www.sarvagyna.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sarvagyna</a>.
            </p>
            <p className="mt-1">
                This Billing Software is Powered By Sarvagyna for CreatorNex LLc.
            </p>
        </footer>
      </div>
    );
  }

  if (!isLoggedIn && pathname !== '/login') {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-center p-2 border-b border-sidebar-border">
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  data-active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 mt-auto border-t border-sidebar-border hidden md:flex items-center justify-center">
           <SidebarTrigger />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <SidebarTrigger />
             <Link href="/" className="flex items-center gap-2">
                <Image src="/sarvagyna-logo.png" alt="Sarvagyna" width={120} height={23} className="object-contain h-[23px] w-[120px]" data-ai-hint="logo" />
            </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="p-4 md:p-6 lg:p-8 text-center text-xs text-muted-foreground border-t">
            <p>
                Sarvagyna Billing is Powered by <a href="https://www.sarvagyna.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sarvagyna</a>.
            </p>
            <p className="mt-1">
                This Billing Software is Powered By Sarvagyna for CreatorNex LLc.
            </p>
        </footer>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
