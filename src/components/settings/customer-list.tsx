"use client"

import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Customer, customerStorage } from "@/lib/customer-storage";
import { Edit, Trash2, Plus } from "lucide-react";
import { CustomerDialog } from "./customer-dialog";

interface CustomerListProps {
    refreshTrigger?: number;
}

export function CustomerList({ refreshTrigger = 0 }: CustomerListProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await customerStorage.getCustomers();
            setCustomers(data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Failed to load customers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            await customerStorage.deleteCustomer(id);
            loadData();
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading customers...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setShowAddDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No customers found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                                            {customer.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingCustomer(customer)}
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(customer.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CustomerDialog
                open={showAddDialog || !!editingCustomer}
                onOpenChange={(open) => {
                    setShowAddDialog(open);
                    if (!open) setEditingCustomer(null);
                }}
                onCustomerSaved={loadData}
                customerToEdit={editingCustomer}
            />
        </div>
    );
}
