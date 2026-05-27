import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuItemConfig } from '../config/menu.config';

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

  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = item.path ? location.pathname === item.path : false;
  
  const menuPath = parentId ? `${parentId}.${item.label}` : item.label;
  const isExpanded = level === 0 && expandedMenuId !== undefined
    ? expandedMenuId === item.label
    : localExpanded;

  // Close submenu when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setLocalExpanded(false);
    }
  }, [collapsed]);

  const handleClick = () => {
    if (hasSubItems) {
      if (level === 0 && setExpandedMenuId) {
        setExpandedMenuId(expandedMenuId === item.label ? null : item.label);
      } else {
        setLocalExpanded(!localExpanded);
      }
    } else if (item.path) {
      navigate(item.path);
      if (onNavigate) {
        onNavigate();
      }
    }
  };

  const getIconElement = () => {
    return <i className={item.icon}></i>;
  };

  return (
    <li className="menu-item">
      <button
        className={`menu-item-button ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        title={collapsed ? item.label : ''}
      >
        <span className="menu-item-icon">
          {getIconElement()}
        </span>
        <span className="menu-item-text">{item.label}</span>
        {hasSubItems && !collapsed && (
          <span className={`menu-item-arrow ${isExpanded ? 'expanded' : ''}`}>
            <i className="fas fa-chevron-right"></i>
          </span>
        )}
      </button>

      {hasSubItems && !collapsed && (
        <ul className={`submenu ${isExpanded ? 'expanded' : ''}`}>
          {item.subItems!.map((subItem, index) => (
            <MenuItem
              key={index}
              item={subItem}
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
