import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSidebar } from '../../context/SidebarContext';
import { modulesConfig } from '../../hims-info/config/modules.config';
import '../../style/sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { collapsed, mobileOpen, closeMobileSidebar } = useSidebar();

  const handleLinkClick = () => {
    closeMobileSidebar();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`module-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : 'mobile-closed'}`}
      >
        <div className="sidebar-header">
          <h5 className="sidebar-title">
            {!collapsed && "MAIN MENU"}
          </h5>
        </div>

        <nav className="sidebar-menu">
          <ul className="menu-list">
            {modulesConfig.map((module) => {
              const isActive = location.pathname.startsWith(module.link);
              
              return (
                <li key={module.id} className="menu-item">
                  <Link
                    to={module.link}
                    className={`menu-link ${isActive ? 'active' : ''}`}
                    onClick={handleLinkClick}
                    title={collapsed ? module.title : ''}
                  >
                    <span className="menu-icon">
                      <i className={module.iconName}></i>
                    </span>
                    {!collapsed && (
                      <span className="menu-text">{module.title}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
