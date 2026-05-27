import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHome } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import MenuItem from './MenuItem';
import { useSidebar } from '../../context/SidebarContext';
import {
  cashCounterMenuConfig,
  filterMenusByAccess,
  getAllAccessCodes,
  MenuItemConfig,
  extractHeaderAndMenuIds
} from '../config/menu.config';
import '../../style/sidebar.css';import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
;

interface SidebarProps {
  // onCollapse prop is no longer needed as we use context
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

  const loadMenus = async () => {
    setLoading(true);
    try {

      const modData = moduleDetails.find(mod => mod.modId === cashCounterMenuConfig.moduleId);

      const allAccessCodes = getAllAccessCodes(cashCounterMenuConfig.menus);

      const getAllHeaderAndMenuIds = extractHeaderAndMenuIds(modData);

      const menuIds = allAccessCodes.menuIds.filter(code => getAllHeaderAndMenuIds.headerIds.includes(code));

      const submenuIds = allAccessCodes.submenuIds.filter(code => getAllHeaderAndMenuIds.menuIds.includes(code));

      const accessCodes = { menuIds, submenuIds };

      const filteredMenus = filterMenusByAccess(
        cashCounterMenuConfig.menus,
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
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-header-title">Cash Counter</h2>
        </div>

        {/* Dashboard Button */}
        {/* <Link to="/hims/dashboard" className="dashboard-btn">
          <FontAwesomeIcon icon={faHome} />
          <span>Dashboard</span>
        </Link> */}

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
