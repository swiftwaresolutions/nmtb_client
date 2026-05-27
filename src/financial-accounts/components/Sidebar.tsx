import React, { useState, useEffect } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import MenuItem from './MenuItem';
import { financialAccountsMenuConfig, MenuItemConfig,getAllAccessCodes,extractHeaderAndMenuIds,filterMenusByAccess } from '../config/menu.config';
import '../../style/sidebar.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

interface SidebarProps {
}

const Sidebar: React.FC<SidebarProps> = () => {
  const { mobileOpen, closeMobileSidebar, collapsed } = useSidebar();
  const [menus, setMenus] = useState<MenuItemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const { moduleDetails } = useSelector((state: RootState) => state.appReducer);


  useEffect(() => {
    loadMenus();
  }, [moduleDetails]);

  useEffect(() => {
    if (collapsed) {
      setMenus([...financialAccountsMenuConfig.menus]);
    }
  }, [collapsed]);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const modData = moduleDetails.find(mod => mod.modId === financialAccountsMenuConfig.moduleId);

      const allAccessCodes = getAllAccessCodes(financialAccountsMenuConfig.menus);

      const getAllHeaderAndMenuIds = extractHeaderAndMenuIds(modData);

      const menuIds = allAccessCodes.menuIds.filter(code => getAllHeaderAndMenuIds.headerIds.includes(code));

      const submenuIds = allAccessCodes.submenuIds.filter(code => getAllHeaderAndMenuIds.menuIds.includes(code));

      const accessCodes = { menuIds, submenuIds };

      const filteredMenus = filterMenusByAccess(
        financialAccountsMenuConfig.menus,
        accessCodes
      );
      setMenus(filteredMenus);
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
          <h2 className="sidebar-header-title">Financial Accounts</h2>
        </div>

        {/* Menu */}
        {loading ? (
          <div className="sidebar-loading">
            <div className="sidebar-loading-spinner"></div>
          </div>
        ) : (
          <ul className="sidebar-menu">
            {menus.map((menu) => (
              <MenuItem
                key={menu.id}
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
