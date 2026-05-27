import React, { useState, useEffect } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import MenuItem from './MenuItem';
import { employeeManagementMenuConfig, MenuItemConfig } from '../config/menu.config';
import '../../style/sidebar.css';

interface SidebarProps {
  // onCollapse prop is no longer needed as we use context
}

const Sidebar: React.FC<SidebarProps> = () => {
  const { mobileOpen, closeMobileSidebar, collapsed } = useSidebar();
  const [menus, setMenus] = useState<MenuItemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  useEffect(() => {
    loadMenus();
  }, []);

  // Close all submenus when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      // Force re-render of menu items to close submenus
      setMenus([...employeeManagementMenuConfig.menus]);
    }
  }, [collapsed]);

  const loadMenus = async () => {
    setLoading(true);
    try {
      // Load all menus from config
      setMenus(employeeManagementMenuConfig.menus);
    } catch (error) {
      console.error('Error loading menus:', error);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={closeMobileSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`module-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

       <div className="sidebar-header">
            <h2 className="sidebar-header-title">Employee Management</h2>
        </div>

        {/* Menu */}
        {loading ? (
          <div className="sidebar-loading">
            <div className="sidebar-loading-spinner"></div>
          </div>
        ) : (
          <ul className="sidebar-menu">
            {menus.map((menu, index) => (
              <MenuItem 
                key={index} 
                item={menu} 
                collapsed={collapsed}
                onNavigate={closeMobileSidebar}
                expandedMenuId={expandedMenuId}
                setExpandedMenuId={setExpandedMenuId}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Sidebar;
