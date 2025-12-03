"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'pm' | 'customer';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    customerId?: string;
}

interface UserContextType {
    role: UserRole;
    setRole: (role: UserRole) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    isProxied: boolean;
    originalRole: UserRole | null;
    proxyAs: (user: User) => void;
    exitProxy: () => void;
    canUpload: boolean;
    canLogTime: boolean;
    canManageDocuments: boolean;
    canManageMeetingNotes: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<UserRole>('admin');
    const [user, setUser] = useState<User | null>({
        id: 'current-user',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin'
    });

    // Proxy state
    const [isProxied, setIsProxied] = useState(false);
    const [originalRole, setOriginalRole] = useState<UserRole | null>(null);
    const [originalUser, setOriginalUser] = useState<User | null>(null);

    // Load proxy state from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('proxyState');

        if (stored) {
            try {
                const { isProxied: storedIsProxied, originalRole: storedOriginalRole, originalUser: storedOriginalUser, targetUser } = JSON.parse(stored);
                if (storedIsProxied) {

                    setIsProxied(true);
                    setOriginalRole(storedOriginalRole);
                    setOriginalUser(storedOriginalUser);
                    setRole(targetUser.role);
                    setUser(targetUser);
                }
            } catch (e) {
                console.error("Failed to load proxy state", e);
                localStorage.removeItem('proxyState');
            }
        }
    }, []);

    const proxyAs = (targetUser: User) => {

        const newOriginalRole = isProxied ? originalRole : role;
        const newOriginalUser = isProxied ? originalUser : user;

        if (!isProxied) {
            setOriginalRole(role);
            setOriginalUser(user);
            setIsProxied(true);
        }
        setRole(targetUser.role);
        setUser(targetUser);

        // Persist to localStorage
        const stateToSave = {
            isProxied: true,
            originalRole: newOriginalRole,
            originalUser: newOriginalUser,
            targetUser: targetUser
        };

        localStorage.setItem('proxyState', JSON.stringify(stateToSave));
    };

    const exitProxy = () => {
        if (isProxied && originalRole && originalUser) {
            setRole(originalRole);
            setUser(originalUser);
            setIsProxied(false);
            setOriginalRole(null);
            setOriginalUser(null);
            localStorage.removeItem('proxyState');
        }
    };

    const canUpload = role === 'admin' || role === 'pm';
    const canLogTime = role === 'admin' || role === 'pm';
    const canManageDocuments = role === 'admin' || role === 'pm';
    const canManageMeetingNotes = role === 'admin' || role === 'pm';

    return (
        <UserContext.Provider value={{
            role,
            setRole,
            user,
            setUser,
            isProxied,
            originalRole,
            proxyAs,
            exitProxy,
            canUpload,
            canLogTime,
            canManageDocuments,
            canManageMeetingNotes
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
