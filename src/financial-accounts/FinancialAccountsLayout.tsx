import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import Sidebar from './components/Sidebar';
import { useSidebar } from '../context/SidebarContext';

const FinancialAccountsLayout: React.FC = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const { collapsed } = useSidebar();

  useEffect(() => {
    // Validate user access
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }
  }, [loginData, navigate]);

  return (
    <div className="financial-accounts-layout" style={{
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

export default FinancialAccountsLayout;
