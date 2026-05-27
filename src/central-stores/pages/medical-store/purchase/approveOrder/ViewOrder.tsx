import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import '../../../../../style/commonStyle.css';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

const ViewOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    const state = location.state as SubModuleState | undefined;
    let resolvedState: SubModuleState | null = state ?? null;

    if (!resolvedState) {
      const storedStore = sessionStorage.getItem('selectedStore');
      if (storedStore) {
        try {
          resolvedState = JSON.parse(storedStore) as SubModuleState;
        } catch {
          resolvedState = null;
        }
      }
    }

    if (!resolvedState?.masterId) {
      navigate('/hims/central-stores', { replace: true });
      return;
    }

    setSubModuleData(resolvedState);
    if (state) {
      sessionStorage.setItem('selectedStore', JSON.stringify(state));
    }
  }, [loginData.authorized, location.state, navigate]);

  return (
    <>
      <div className="container-fluid p-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-eye me-2"></i>
                View Order
              </h4>
            </div>
            <div className="card-body text-center py-5">
              <i className="fas fa-hard-hat fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Under Construction</h5>
              <p className="text-muted">This feature is coming soon.</p>
            </div>
          </div>
        </div>
    </>
  );
};

export default ViewOrder;
