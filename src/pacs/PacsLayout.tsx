import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './components/Sidebar';

const PacsLayout: React.FC = () => {
  const { collapsed } = useSidebar();

  return (
    <div className="pacs-layout" style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
    }}>
      <Sidebar />
      <div className={`module-content ${collapsed ? 'expanded' : ''}`} style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default PacsLayout;
