import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuItemConfig, getIconObject } from '../config/menu.config';

interface MenuItemProps {
  item: MenuItemConfig;
  level?: number;
  collapsed: boolean;
  onNavigate?: () => void;
  expandedMenuId?: string | null;
  setExpandedMenuId?: (id: string | null) => void;
  parentId?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, level = 0, collapsed, onNavigate, expandedMenuId, setExpandedMenuId, parentId }) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasSubmenus = item.submenus && item.submenus.length > 0;
  const isActive = item.route ? location.pathname === item.route : false;

  // For level 0 (top-level) menus, use shared state; for nested menus, use local state
  const expanded = level === 0 ? expandedMenuId === item.id : localExpanded;

  const handleClick = () => {
    if (hasSubmenus) {
      if (!collapsed) {
        if (level === 0 && setExpandedMenuId) {
          // Top-level menu: toggle using shared state
          setExpandedMenuId(expanded ? null : item.id);
        } else {
          // Nested menu: toggle using local state
          setLocalExpanded(!localExpanded);
        }
      }
    } else if (item.route) {
      navigate(item.route);
      if (onNavigate) {
        onNavigate();
      }
    }
  };

  return (
    <li className="menu-item">
      <button
        className={`menu-item-button ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        style={{ paddingLeft: `${level === 0 ? 1 : level * 1.5 + 1}rem` }}
      >
        <span className="menu-item-icon">
          <FontAwesomeIcon icon={getIconObject(item.icon)} />
        </span>
        <span className="menu-item-text">{item.label}</span>
        {hasSubmenus && (
          <span className={`menu-item-arrow ${expanded ? 'expanded' : ''}`}>
            <FontAwesomeIcon icon={faChevronRight} />
          </span>
        )}
      </button>

      {hasSubmenus && !collapsed && (
        <ul className={`submenu ${expanded ? 'expanded' : ''}`}>
          {item.submenus!.map((submenu) => (
            <MenuItem
              key={submenu.id}
              item={submenu}
              level={level + 1}
              collapsed={collapsed}
              onNavigate={onNavigate}
              expandedMenuId={expandedMenuId}
              setExpandedMenuId={setExpandedMenuId}
              parentId={item.id}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
