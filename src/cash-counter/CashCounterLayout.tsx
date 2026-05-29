import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import Sidebar from './components/Sidebar';
import { useSidebar } from '../context/SidebarContext';

const CashCounterLayout: React.FC = () => {
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const { collapsed } = useSidebar();

  useEffect(() => {
    // Clear pharmacy session data when entering Cash Counter module
    sessionStorage.removeItem('pharmacySubModuleData');
    
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

  }, [loginData, navigate]);

  return (
    <div className="cash-counter-layout selection-area-login-theme" style={{
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

export default CashCounterLayout;
