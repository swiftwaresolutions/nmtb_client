import React, { useState, useEffect } from 'react';
import MenuItem from './MenuItem';
import { useSidebar } from '../context/SidebarContext';
import {
  pharmacyStoresMenuConfig,
  filterMenusByAccess,
  getAllAccessCodes,
  MenuItemConfig,
  extractHeaderAndMenuIds
} from '../config/menu.config';
import '../../style/sidebar.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

interface SidebarProps {
  subModuleName?: string;
  subModuleId?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ subModuleName, subModuleId }) => {
  const { mobileOpen, closeMobileSidebar, collapsed, expandedMenuId, setExpandedMenuId } = useSidebar();
  const [menus, setMenus] = useState<MenuItemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { moduleDetails } = useSelector((state: RootState) => state.appReducer);

  useEffect(() => {
    loadMenus();
  }, [moduleDetails, subModuleId]);

  const loadMenus = async () => {
    setLoading(true);
    try {

      const modData = moduleDetails.find(mod => mod.modId === pharmacyStoresMenuConfig.moduleId);

      const pharmaStoreData: any[] = modData?.subModIds
        ? modData.subModIds.filter((subMod: any) => {
          const id = typeof subMod === 'object' && subMod.subModId !== undefined
            ? subMod.subModId
            : typeof subMod === 'number'
              ? subMod
              : undefined;

          return id === subModuleId;
        })
        : [];

      const allAccessCodes = getAllAccessCodes(pharmacyStoresMenuConfig.menus);

      const getAllHeaderAndMenuIds = extractHeaderAndMenuIds(pharmaStoreData);

      const menuIds = allAccessCodes.menuIds.filter(code => getAllHeaderAndMenuIds.headerIds.includes(code));

      const submenuIds = allAccessCodes.submenuIds.filter(code => getAllHeaderAndMenuIds.menuIds.includes(code));

      const accessCodes = { menuIds, submenuIds };

      const filteredMenus = filterMenusByAccess(pharmacyStoresMenuConfig.menus, accessCodes);

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
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-header-title">
            {subModuleName || 'Pharmacy Store'}
          </h2>
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
