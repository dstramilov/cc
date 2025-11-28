"use client"

import React, { createContext, useContext, useState, useEffect } from "react";

interface FilterContextType {
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  selectedProjectIds: string[];
  setSelectedProjectIds: (ids: string[]) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  // Clear selected projects when customer changes
  useEffect(() => {
    setSelectedProjectIds([]);
  }, [selectedCustomerId]);

  return (
    <FilterContext.Provider
      value={{
        selectedCustomerId,
        setSelectedCustomerId,
        selectedProjectIds,
        setSelectedProjectIds,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
