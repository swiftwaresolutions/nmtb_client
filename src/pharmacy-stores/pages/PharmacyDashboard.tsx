import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import { showValidationError } from '../../utils/alertUtil';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

const PharmacyDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const { collapsed } = useSidebar();
  
  // Initialize subModuleData from location state or sessionStorage
  const [subModuleData] = useState<SubModuleState | null>(() => {
    const state = location.state as SubModuleState;
    if (state) {
      // Clear central stores session data to prevent conflicts when switching modules
      sessionStorage.removeItem('selectedStore');
      // Store in sessionStorage for persistence
      sessionStorage.setItem('pharmacySubModuleData', JSON.stringify(state));
      return state;
    }
    // Try to retrieve from sessionStorage
    const stored = sessionStorage.getItem('pharmacySubModuleData');
    if (stored) {
      // Clear central stores session data to prevent conflicts
      sessionStorage.removeItem('selectedStore');
    }
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    if (!subModuleData?.masterId) {
      showValidationError('Pharmacy store context is missing. Please reselect the store.');
      navigate('/hims/pharmacy-stores', { state: { moduleId: 3 }, replace: true });
    }
  }, [loginData.authorized, navigate, subModuleData?.masterId]);

  const handleBackToSubModules = () => {
    navigate('/hims/pharmacy-stores', { state: { moduleId: 3 } });
  };

  return (
    <div 
      className="pharmacy-stores-layout"
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        minHeight: 0,
        overflow: "hidden"
      }}
    >
      <Sidebar 
        subModuleName={subModuleData?.subModName || 'Pharmacy Store'}
        subModuleId={subModuleData?.subModId}
      />
      
      <div 
        className={`module-content ${collapsed ? 'expanded' : ''}`}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden"
        }}
      >
        {/* Scrollable Content - Renders child routes */}
        <div 
          className="content-body p-0"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "1.5rem",
            backgroundColor: "#f4f6f8"
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
