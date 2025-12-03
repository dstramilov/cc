import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Customer, customerStorage } from "@/lib/customer-storage";
import { User, userStorage } from "@/lib/user-storage";

interface AddCustomerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCustomerAdded: () => void;
}

export function AddCustomerDialog({ open, onOpenChange, onCustomerAdded }: AddCustomerDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        externalId: '',
        name: '',
        email: '',
        primaryUserName: '',
        primaryUserEmail: '',
    });

    const generateTempPassword = () => {
        return `Temp${Math.random().toString(36).slice(-8)}!`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const customerId = `CUST-${Date.now()}`;
            const userId = `USER-${Date.now()}`;
            const tempPassword = generateTempPassword();

            // Create primary user
            const newUser: User = {
                id: userId,
                name: formData.primaryUserName,
                email: formData.primaryUserEmail,
                role: 'customer',
                customerId: customerId,
                // password: tempPassword, // Managed by Supabase Auth
                // mustChangePassword: true,
                status: 'active',
                createdAt: new Date().toISOString(),
            };

            // Create customer with primary user reference
            const newCustomer: Customer = {
                id: customerId,
                externalId: formData.externalId,
                name: formData.name,
                email: formData.email,
                status: 'active',
                primaryUserId: userId,
                createdAt: new Date().toISOString(),
            };

            await userStorage.saveUser(newUser);
            await customerStorage.saveCustomer(newCustomer);

            // Simulate email notification
            // console.log(`[EMAIL SENT] To: ${formData.primaryUserEmail}`);
            // console.log(`Subject: Welcome to Customer Central`);
            // console.log(`Temporary Password: ${tempPassword}`);
            // console.log(`You will be required to change this password on first login.`);

            alert(`Customer and Primary User created!\n\nTemporary password for ${formData.primaryUserEmail}: ${tempPassword}\n\n(In production, this would be sent via email)`);

            setFormData({ externalId: '', name: '', email: '', primaryUserName: '', primaryUserEmail: '' });
            onCustomerAdded();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to add customer:', error);
            alert('Failed to create customer. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                        Create a new customer profile and primary user. Internal ID will be auto-generated.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm">Customer Details</h4>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="externalId" className="text-right">
                                    External ID
                                </Label>
                                <Input
                                    id="externalId"
                                    value={formData.externalId}
                                    onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g., EXT-123"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Company Name"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="col-span-3"
                                    placeholder="contact@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h4 className="font-medium text-sm">Primary User</h4>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="primaryUserName" className="text-right">
                                    User Name
                                </Label>
                                <Input
                                    id="primaryUserName"
                                    value={formData.primaryUserName}
                                    onChange={(e) => setFormData({ ...formData, primaryUserName: e.target.value })}
                                    className="col-span-3"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="primaryUserEmail" className="text-right">
                                    User Email
                                </Label>
                                <Input
                                    id="primaryUserEmail"
                                    type="email"
                                    value={formData.primaryUserEmail}
                                    onChange={(e) => setFormData({ ...formData, primaryUserEmail: e.target.value })}
                                    className="col-span-3"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground col-span-4 text-center">
                                A temporary password will be sent to this email address.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Customer & User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
