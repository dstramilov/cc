import React, { useEffect, useState } from 'react';
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
import { User, userStorage } from "@/lib/user-storage";
import { Customer, customerStorage } from "@/lib/customer-storage";
import { Power, PowerOff, Trash2, Edit, Eye } from "lucide-react";
import { UserDialog } from "./user-dialog";
import { useUser } from "@/lib/user-context";
import { useRouter } from "next/navigation";

interface UserListProps {
    refreshTrigger: number;
}

export function UserList({ refreshTrigger }: UserListProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [customers, setCustomers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { role: currentUserRole, user: currentUser, proxyAs } = useUser();
    const currentUserId = currentUser?.id;
    const router = useRouter();

    const handleProxy = (targetUser: User) => {
        console.log("Proxy requested for:", targetUser.name);
        // if (confirm(`Are you sure you want to proxy as ${targetUser.name}? You will see the app as they see it.`)) {
        // Map storage user to context user (they are compatible)
        console.log("Calling proxyAs...");
        proxyAs({
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role
        });
        console.log("Redirecting to dashboard...");
        router.push('/'); // Redirect to dashboard
        // }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, customersData] = await Promise.all([
                userStorage.getUsers(),
                customerStorage.getCustomers()
            ]);

            setUsers(usersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

            // Create customer lookup map
            const custMap: Record<string, string> = {};
            customersData.forEach(c => custMap[c.id] = c.name);
            setCustomers(custMap);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        await userStorage.updateUserStatus(user.id, newStatus);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await userStorage.deleteUser(id);
            loadData();
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading users...</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="capitalize">
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {user.customerId ? customers[user.customerId] || 'Unknown' : '-'}
                            </TableCell>
                            <TableCell>
                                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                    {user.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {currentUserRole === 'admin' && user.id !== currentUserId && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleProxy(user)}
                                            title={`Proxy as ${user.name}`}
                                        >
                                            <Eye className="h-4 w-4 text-purple-500" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingUser(user)}
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4 text-blue-500" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleStatus(user)}
                                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                    >
                                        {user.status === 'active' ? (
                                            <Power className="h-4 w-4 text-orange-500" />
                                        ) : (
                                            <PowerOff className="h-4 w-4 text-green-500" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(user.id)}
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No users found. Add one to get started.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {editingUser && (
                <UserDialog
                    open={!!editingUser}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                    onUserSaved={() => {
                        setEditingUser(null);
                        loadData();
                    }}
                    userToEdit={editingUser}
                />
            )}
        </div>
    );
}
