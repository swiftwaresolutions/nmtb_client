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

  const hasSubmenus = item.submenus && item.submenus.length > 0;
  const isActive = item.url ? location.pathname === item.url : false;
  
  const menuPath = parentId ? `${parentId}.${item.id}` : item.id;
  const isExpanded = level === 0 && expandedMenuId !== undefined
    ? expandedMenuId === item.id
    : localExpanded;

  const getFallbackIconColor = () => {
    const palette = [
      'var(--btn-primary)',
      'var(--btn-success)',
      'var(--color-info)',
      'var(--color-warning)',
      'var(--color-danger)',
      'var(--primary-color)'
    ];

    const seed = `${menuPath}-${item.name}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    const index = Math.abs(hash) % palette.length;
    return palette[index];
  };

  const resolvedIconColor = item.iconColor ?? getFallbackIconColor();

  // Close submenu when sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setLocalExpanded(false);
    }
  }, [collapsed]);

  const handleClick = () => {
    if (hasSubmenus) {
      if (level === 0 && setExpandedMenuId) {
        setExpandedMenuId(expandedMenuId === item.id ? null : item.id);
      } else {
        setLocalExpanded(!localExpanded);
      }
    } else if (item.url) {
      navigate(item.url);
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
        title={collapsed ? item.name : ''}
      >
        <span
          className="menu-item-icon"
          style={{ '--menu-icon-color': resolvedIconColor } as React.CSSProperties}
        >
          {getIconElement()}
        </span>
        <span className="menu-item-text">{item.name}</span>
        {hasSubmenus && !collapsed && (
          <span className={`menu-item-arrow ${isExpanded ? 'expanded' : ''}`}>
            <i className="fas fa-chevron-right"></i>
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
