import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { MenuItemConfig } from '../config/menu.config';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItemProps {
  item: MenuItemConfig;
  level?: number;
  collapsed: boolean;
  onNavigate?: () => void;
  expandedMenuId?: string | null;
  setExpandedMenuId?: (id: string | null) => void;
  parentId?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  level = 0, 
  collapsed,
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
  
  const isExpanded = level === 0 ? expandedMenuId === item.id : localExpanded;

  const handleClick = () => {
    if (hasSubmenus) {
      if (!collapsed) {
        if (level === 0 && setExpandedMenuId) {
          setExpandedMenuId(isExpanded ? null : item.id);
        } else {
          setLocalExpanded(!localExpanded);
        }
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

  const renderMenuItem = () => (
    <button
      className={`menu-item-button ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      title={collapsed ? item.name : ''}
      style={{ paddingLeft: `${level === 0 ? 1 : level * 1.5 + 1}rem` }}
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
  );

  return (
    <li className="menu-item">
      {renderMenuItem()}

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
              parentId={item.id}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
