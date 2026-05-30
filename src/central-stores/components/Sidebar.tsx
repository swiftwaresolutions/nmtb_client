import React, { useState, useEffect } from 'react';
import MenuItem from './MenuItem';
import { useSidebar } from '../../context/SidebarContext';
import {
  medicalStoreMenuConfig,
  nonMedicalStoreMenuConfig,
  filterMenusByAccess,
  getAllAccessCodes,
  MenuItemConfig,
  extractHeaderAndMenuIds
} from '../config/menu.config';
import '../../style/sidebar.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

interface SubModuleData {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

interface SidebarProps {
  moduleType?: 'medical-store' | 'non-medical-store';
  subModuleName?: string;
  subModuleData?: SubModuleData | null;
}

const Sidebar: React.FC<SidebarProps> = ({ moduleType, subModuleName, subModuleData }) => {
  const { mobileOpen, closeMobileSidebar, collapsed } = useSidebar();
  const [menus, setMenus] = useState<MenuItemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  const { moduleDetails } = useSelector((state: RootState) => state.appReducer);

  const activeModuleType = moduleType ?? 'medical-store';
  const menuConfig = activeModuleType === 'medical-store' ? medicalStoreMenuConfig : nonMedicalStoreMenuConfig;
  const subModuleId = subModuleData?.subModId;

  const loadMenus = async () => {
    setLoading(true);
    try {
      const modData = moduleDetails.find(mod => mod.modId === menuConfig.moduleId);

      const allAccessCodes = getAllAccessCodes(menuConfig.menus);
      const getAllHeaderAndMenuIds = extractHeaderAndMenuIds(modData, subModuleId);

      const menuIds = allAccessCodes.menuIds.filter((code: number) => getAllHeaderAndMenuIds.headerIds.includes(code));
      const submenuIds = allAccessCodes.submenuIds.filter((code: number) => getAllHeaderAndMenuIds.menuIds.includes(code));

      const accessCodes = { menuIds, submenuIds };
      const filteredMenus = filterMenusByAccess(menuConfig.menus, accessCodes);
      setMenus(filteredMenus);
    } catch (error) {
      console.error('Error loading menus:', error);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, [moduleDetails, moduleType, subModuleId]);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'show' : ''}`}
        onClick={closeMobileSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`module-sidebar selection-area-login-theme ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-header-title">
            {subModuleName || (activeModuleType === 'medical-store' ? 'Medical Store' : 'Non-Medical Store')}
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
