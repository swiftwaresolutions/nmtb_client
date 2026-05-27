import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './components/Sidebar';

const PayrollManagementLayout: React.FC = () => {
  const { collapsed } = useSidebar();

  return (
    <div className="payroll-management-layout" style={{
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

export default PayrollManagementLayout;
