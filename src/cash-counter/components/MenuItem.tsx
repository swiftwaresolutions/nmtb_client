import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
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

const MenuItem: React.FC<MenuItemProps> = ({ item, level = 0, collapsed = false, onNavigate, expandedMenuId, setExpandedMenuId, parentId }) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const location = useLocation();
  const hasSubmenus = item.submenus && item.submenus.length > 0;
  const isActive = item.url ? location.pathname === item.url : false;

  // For level 0 (top-level) menus, use shared state; for nested menus, use local state
  const expanded = level === 0 ? expandedMenuId === item.id : localExpanded;

  const handleClick = () => {
    if (hasSubmenus) {
      if (level === 0 && setExpandedMenuId) {
        // Top-level menu: toggle using shared state
        setExpandedMenuId(expanded ? null : item.id);
      } else {
        // Nested menu: toggle using local state
        setLocalExpanded(!localExpanded);
      }
    } else if (item.url && onNavigate) {
      onNavigate();
    }
  };

  // Get icon element using FontAwesome CSS classes
  const getIconElement = () => {
    return <i className={item.icon}></i>;
  };

  const renderMenuItem = () => {
    const content = (
      <>
        <span className="menu-item-icon">
          {getIconElement()}
        </span>
        <span className="menu-item-text">{item.name}</span>
        {hasSubmenus && (
          <span className={`menu-item-arrow ${expanded ? 'expanded' : ''}`}>
            <FontAwesomeIcon icon={faChevronRight} />
          </span>
        )}
      </>
    );

    if (item.url && !hasSubmenus) {
      return (
        <Link
          to={item.url}
          className={`menu-item-button ${isActive ? 'active' : ''}`}
          onClick={handleClick}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        className={`menu-item-button ${isActive ? 'active' : ''}`}
        onClick={handleClick}
      >
        {content}
      </button>
    );
  };

  return (
    <li className="menu-item">
      {renderMenuItem()}
      {hasSubmenus && (
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
