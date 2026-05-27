import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../../context/SidebarContext';
import { showValidationError } from '../../utils/alertUtil';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

const MedicalStoreDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const { collapsed } = useSidebar();

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    const state = location.state as SubModuleState | undefined;
    let resolvedState: SubModuleState | null = state ?? null;

    if (!resolvedState) {
      const storedData = sessionStorage.getItem('selectedStore');
      if (storedData) {
        try {
          resolvedState = JSON.parse(storedData) as SubModuleState;
        } catch {
          resolvedState = null;
        }
      }
    }

    if (!resolvedState?.masterId) {
      showValidationError('Store context is missing. Please reselect the store.');
      navigate('/hims/central-stores', { replace: true });
      return;
    }

    setSubModuleData(resolvedState);
    if (state) {
      sessionStorage.setItem('selectedStore', JSON.stringify(state));
    }
  }, [loginData.authorized, location.state, navigate]); 

  const handleBackToSubModules = () => {
    // Clear store data when navigating back
    sessionStorage.removeItem('selectedStore');
    navigate('/hims/central-stores');
  };

  return (
    <div 
      className="central-stores-layout"
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        minHeight: 0,
        overflow: "hidden"
      }}
    >
      <Sidebar 
        moduleType="medical-store" 
        subModuleName={subModuleData?.subModName || 'Medical Store'}
        subModuleData={subModuleData}
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
        {/* Header */}
        
          
        

        {/* Scrollable Content */}
        <div 
          className="content-body"
          style={{
            flex: 1,
            // minHeight: 0,
            overflow: "hidden",
            backgroundColor: "#f4f6f8",
            padding : 0,
            height: "100vh"
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MedicalStoreDashboard;
