import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSidebar as useGlobalSidebar } from '../../context/SidebarContext';

interface SidebarContextType {
    mobileOpen: boolean;
    toggleMobileSidebar: () => void;
    closeMobileSidebar: () => void;
    collapsed: boolean;
    toggleSidebar: () => void;
    expandedMenuId: string | null;
    setExpandedMenuId: (id: string | null) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        mobileOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        collapsed,
        toggleSidebar,
    } = useGlobalSidebar();
    const [expandedMenuId, setExpandedMenuId] = useState<string | null>(() => {
        const saved = localStorage.getItem('pharmacyExpandedMenuId');
        return saved || null;
    });

    useEffect(() => {
        if (expandedMenuId) {
            localStorage.setItem('pharmacyExpandedMenuId', expandedMenuId);
        } else {
            localStorage.removeItem('pharmacyExpandedMenuId');
        }
    }, [expandedMenuId]);

    useEffect(() => {
        if (collapsed) {
            setExpandedMenuId(null);
        }
    }, [collapsed]);

    return (
        <SidebarContext.Provider value={{ mobileOpen, toggleMobileSidebar, closeMobileSidebar, collapsed, toggleSidebar, expandedMenuId, setExpandedMenuId }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within SidebarProvider');
    }
    return context;
};
