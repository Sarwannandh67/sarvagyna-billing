
"use client"; 

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, PlusCircle, Package, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { useToast } from "@/hooks/use-toast"; // For future use

interface Item { // Placeholder for item structure
  id: string; 
  name: string; 
  description: string; 
  price: string | number; 
}

export default function ItemsPage() {
  // const { toast } = useToast(); // For future use
  const items: Item[] = []; // Placeholder data - this page currently doesn't save/load items

  const handleViewItem = (itemId: string) => {
    alert(`View item: ${itemId}\n(Functionality to be implemented)`);
  };

  const handleEditItem = (itemId: string) => {
    alert(`Edit item: ${itemId}\n(Functionality to be implemented)`);
  };

  const handleDeleteItem = (itemId: string) => {
    alert(`Delete item: ${itemId}\n(Data persistence for items not yet implemented)`);
    // When implemented:
    // if (window.confirm(`Are you sure you want to delete item ${itemId}?`)) {
    //   // Logic to remove item from state and localStorage
    //   toast({ title: "Item Deleted" });
    // }
  };


  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center">
            <Package className="mr-3 h-8 w-8" /> Items / Services
          </h1>
          <p className="text-muted-foreground mt-1">Manage your recurring items and services for quick invoicing.</p>
        </div>
        <Button disabled> {/* Add item form not implemented yet */}
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Item/Service
        </Button>
      </header>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Item & Service List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items/services by name or ID..." className="pl-8 w-full sm:w-1/2 lg:w-1/3" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Default Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No items or services found. Click "Add New Item/Service" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => ( 
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{item.description}</TableCell>
                    <TableCell>{typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewItem(item.id)}>
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditItem(item.id)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteItem(item.id)}
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
            Full item/service management, including forms for adding/editing, will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
