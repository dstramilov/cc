"use client"

import React, { createContext, useContext, useState, useEffect } from "react";

interface UIPreferencesContextType {
    showInternalIds: boolean;
    setShowInternalIds: (show: boolean) => void;
}

const UIPreferencesContext = createContext<UIPreferencesContextType | undefined>(undefined);

export function UIPreferencesProvider({ children }: { children: React.ReactNode }) {
    const [showInternalIds, setShowInternalIds] = useState<boolean>(false);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("showInternalIds");
        if (stored !== null) {
            setShowInternalIds(JSON.parse(stored));
        }
    }, []);

    // Save to localStorage on change
    const handleSetShowInternalIds = (show: boolean) => {
        setShowInternalIds(show);
        localStorage.setItem("showInternalIds", JSON.stringify(show));
    };

    return (
        <UIPreferencesContext.Provider
            value={{
                showInternalIds,
                setShowInternalIds: handleSetShowInternalIds,
            }}
        >
            {children}
        </UIPreferencesContext.Provider>
    );
}

export function useUIPreferences() {
    const context = useContext(UIPreferencesContext);
    if (context === undefined) {
        throw new Error("useUIPreferences must be used within a UIPreferencesProvider");
    }
    return context;
}
