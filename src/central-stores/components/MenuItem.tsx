import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { MenuItemConfig } from '../config/menu.config';
import { useNavigate, useLocation } from 'react-router-dom';

interface SubModuleData {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

interface MenuItemProps {
  item: MenuItemConfig;
  level?: number;
  collapsed?: boolean;
  onNavigate?: () => void;
  expandedMenuId?: string | null;
  setExpandedMenuId?: (id: string | null) => void;
  parentId?: string;
  subModuleData?: SubModuleData | null;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  level = 0, 
  collapsed = false,
  onNavigate,
  expandedMenuId,
  setExpandedMenuId,
  parentId,
  subModuleData
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasSubmenus = item.submenus && item.submenus.length > 0;
  const isActive = item.url ? location.pathname === item.url : false;
  
  const menuPath = parentId ? `${parentId}.${item.id}` : item.id;
  const isExpanded = level === 0 && expandedMenuId !== undefined
    ? expandedMenuId === item.id
    : localExpanded;

  // Check if any child submenu is active and keep parent expanded
  const hasActiveChild = React.useMemo(() => {
    if (!hasSubmenus) return false;
    
    const checkActive = (menus: MenuItemConfig[]): boolean => {
      return menus.some(menu => {
        if (menu.url === location.pathname) return true;
        if (menu.submenus) return checkActive(menu.submenus);
        return false;
      });
    };
    
    return checkActive(item.submenus!);
  }, [hasSubmenus, item.submenus, location.pathname]);

  // Keep submenu expanded if any child is active
  React.useEffect(() => {
    if (hasActiveChild && level > 0) {
      setLocalExpanded(true);
    }
  }, [hasActiveChild, level]);

  // Collapse submenu when parent sidebar is collapsed
  React.useEffect(() => {
    if (collapsed) {
      setLocalExpanded(false);
    }
  }, [collapsed]);

  const handleClick = () => {
    if (hasSubmenus && !collapsed) {
      if (level === 0 && setExpandedMenuId) {
        // Toggle the expanded state for top-level menu items
        setExpandedMenuId(expandedMenuId === item.id ? null : item.id);
      } else {
        setLocalExpanded(!localExpanded);
      }
    } else if (item.url) {
      // Pass navigation state to preserve subModuleData
      if (subModuleData) {
        navigate(item.url, { state: subModuleData });
      } else {
        navigate(item.url);
      }
      // Only close sidebar on mobile devices (< 768px)
      if (onNavigate && window.innerWidth < 768) {
        onNavigate();
      }
      // Don't call onNavigate for desktop to keep sidebar open
    }
  };

  // Get icon component (for FontAwesome)
  const getIconElement = () => {
    return <i className={item.icon}></i>;
  };

  return (
    <li className="menu-item">
      <button
        type="button"
        className={`menu-item-button ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        title={collapsed ? item.name : ''}
      >
        <span className="menu-item-icon">
          {getIconElement()}
        </span>
        <span className="menu-item-text">{item.name}</span>
        {hasSubmenus && !collapsed && (
          <span className={`menu-item-arrow ${isExpanded ? 'expanded' : ''}`}>
            <FontAwesomeIcon icon={faChevronRight} />
          </span>
        )}
      </button>

      {hasSubmenus && !collapsed && (
        <ul className={`submenu ${isExpanded ? 'expanded' : ''}`}>
          {item.submenus!.map((subitem) => (
            <MenuItem
              key={subitem.id}
              item={subitem}
              level={level + 1}
              collapsed={collapsed}
              onNavigate={onNavigate}
              expandedMenuId={expandedMenuId}
              setExpandedMenuId={setExpandedMenuId}
              parentId={menuPath}
              subModuleData={subModuleData}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
