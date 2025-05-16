
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, PlusCircle, Users2, MoreHorizontal, Loader2 } from "lucide-react";
import type { Client } from "@/types/invoice"; 
import { CLIENTS_STORAGE_KEY } from "@/types/invoice"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    const storedClientsRaw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!storedClientsRaw) {
      setClients([]);
    } else {
      try {
        const parsedClients = JSON.parse(storedClientsRaw);
        if (Array.isArray(parsedClients)) {
          setClients(parsedClients);
        } else {
          console.warn("Loaded clients from localStorage is not an array.");
          setClients([]);
        }
      } catch (e) {
        console.error("Error parsing clients from localStorage:", e);
        setClients([]);
      }
    }
    setIsLoading(false);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewClient = (clientId: string) => {
    alert(`View client: ${clientId}\n(Functionality to be implemented)`);
  };

  const handleEditClient = (clientId: string) => {
    alert(`Edit client: ${clientId}\n(Functionality to be implemented)`);
  };

  const handleDeleteClient = (clientId: string) => {
    const clientToDelete = clients.find(c => c.id === clientId);
    const clientName = clientToDelete ? clientToDelete.name : clientId;
    if (window.confirm(`Are you sure you want to delete client ${clientName}? This action cannot be undone.`)) {
      try {
        const updatedClients = clients.filter(client => client.id !== clientId);
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(updatedClients));
        setClients(updatedClients);
        toast({
          title: "Client Deleted",
          description: `Client "${clientName}" has been successfully deleted.`,
        });
      } catch (e) {
        console.error("Error deleting client:", e);
        toast({
          title: "Error",
          description: "Could not delete client. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center">
            <Users2 className="mr-3 h-8 w-8" /> Clients
          </h1>
          <p className="text-muted-foreground mt-1">Manage your client information.</p>
        </div>
        <Button disabled> {/* Add client form not implemented yet */}
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
        </Button>
      </header>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search clients by name or email..." 
              className="pl-8 w-full sm:w-1/2 lg:w-1/3" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Billed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    {clients.length === 0 ? 'No clients found. Save an invoice to add a client.' : 'No clients match your search.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-xs truncate" style={{maxWidth: '100px'}}>{client.id}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.email || 'N/A'}</TableCell>
                    <TableCell>{client.phone || 'N/A'}</TableCell>
                    <TableCell>{client.totalBilled?.toLocaleString(undefined, { style: 'currency', currency: 'INR' }) ?? 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClient(client.id)}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClient(client.id)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClient(client.id)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
           <p className="text-xs text-muted-foreground mt-4 text-center">
            Client data is loaded from local storage. Add/edit/delete functionality coming soon for some actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

