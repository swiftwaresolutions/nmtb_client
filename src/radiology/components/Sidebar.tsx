import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import MenuItem from './MenuItem';
import { useSidebar } from '../../context/SidebarContext';
import { 
  radiologyMenuConfig, 
  filterMenusByAccess, 
  getAllAccessCodes,
  MenuItemConfig 
} from '../config/menu.config';
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
    // Load menus - For now, show all menus without API call
    // TODO: Replace with API call to get user's access rights
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    try {
      // TODO: Replace this with actual API call
      // const response = await apiService.getModuleMenuAccess(12);
      // const userAccessCodes = response.accessCodes;
      
      // For now, show all menus (get all access codes)
      const allAccessCodes = getAllAccessCodes(radiologyMenuConfig.menus);
      
      // Filter menus based on access
      const filteredMenus = filterMenusByAccess(
        radiologyMenuConfig.menus,
        allAccessCodes
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
          <h2 className="sidebar-header-title">Radiology</h2>
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
