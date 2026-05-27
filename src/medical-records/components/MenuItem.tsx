import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { MenuItemConfig } from '../config/menu.config';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItemProps {
  item: MenuItemConfig;
  level?: number;
  collapsed?: boolean;
  onNavigate?: () => void;
  expandedMenuId?: string | null;
  setExpandedMenuId?: (id: string | null) => void;
  parentId?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  level = 0, 
  collapsed = false,
  onNavigate,
  expandedMenuId,
  setExpandedMenuId,
  parentId
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasSubmenus = item.submenus && item.submenus.length > 0;
  const isActive = item.url ? location.pathname === item.url : false;
  
  // For top-level menus, use expandedMenuId from parent
  // For nested menus, use local state
  const menuPath = parentId ? `${parentId}.${item.id}` : item.id;
  const isExpanded = level === 0 && expandedMenuId !== undefined
    ? expandedMenuId === item.id
    : localExpanded;

  const handleClick = () => {
    if (hasSubmenus) {
      if (level === 0 && setExpandedMenuId) {
        // Top-level menu - use shared state to close others
        setExpandedMenuId(expandedMenuId === item.id ? null : item.id);
      } else {
        // Nested menu - use local state
        setLocalExpanded(!localExpanded);
      }
    } else if (item.url) {
      navigate(item.url);
      if (onNavigate) {
        onNavigate();
      }
    }
  };

  // Get icon component (for FontAwesome)
  const getIconElement = () => {
    return <i className={item.icon}></i>;
  };

  return (
    <li className="menu-item">
      <button
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
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
