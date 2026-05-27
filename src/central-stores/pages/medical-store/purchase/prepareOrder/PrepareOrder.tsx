import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import PageHeader from '../../../../../components/PageHeader';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import '../../../../../style/commonStyle.css';
import PrepareOrderFilter from './PrepareOrderFilter';
import PrepareOrderReorderLevel from './PrepareOrderReorderLevel';
import PrepareOrderSupplierWise from './PrepareOrderSupplierWise';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}

type ViewType = 
  | 'below-reorder' 
  | 'all-products' 
  | 'supplier-wise';

interface ViewOption {
  id: ViewType;
  title: string;
  description: string;
  icon: string;
}

const PrepareOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const [activeView, setActiveView] = useState<ViewType | null>(null);

  const viewOptions: ViewOption[] = [
    {
      id: 'below-reorder',
      title: 'Items Below Minimum Stock Level',
      description: 'View items that need immediate replenishment',
      icon: 'fas fa-exclamation-triangle'
    },
    {
      id: 'all-products',
      title: 'All Items in Inventory',
      description: 'View complete pharmaceutical inventory',
      icon: 'fas fa-boxes'
    },
    {
      id: 'supplier-wise',
      title: 'Vendor-wise Item List',
      description: 'View items grouped by vendors',
      icon: 'fas fa-truck'
    }
  ];

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    // Get state from location or sessionStorage
    const state = location.state as SubModuleState;
    if (state) {
      setSubModuleData(state);
    } else {
      // Try to get from sessionStorage
      const storedData = sessionStorage.getItem('selectedStore');
      if (storedData) {
        setSubModuleData(JSON.parse(storedData));
      }
    }
  }, [loginData, navigate]); // Removed location.state to prevent re-renders

  const handleViewSelect = (viewType: ViewType) => {
    sessionStorage.setItem('prepareOrderViewType', viewType);
    setActiveView(viewType);
  };

  const handleBack = () => {
    // Use relative navigation to go back to dashboard (works for both medical and non-medical stores)
    navigate(-1);
  };

  if (activeView === 'below-reorder') {
    return <PrepareOrderReorderLevel onBack={() => setActiveView(null)} />;
  }

  if (activeView === 'supplier-wise') {
    return <PrepareOrderSupplierWise onBack={() => setActiveView(null)} />;
  }

  if (activeView === 'all-products') {
    return <PrepareOrderFilter onBack={() => setActiveView(null)} />;
  }

  return (
    <>
      <div className="container-fluid p-0">
          {/* Header Section */}
          <PageHeader
            icon={faShoppingCart}
            title="Draft Purchase Order"
            subtitle="Select a view type to prepare your purchase order"
            
          />

          {/* View Options Section */}
          <div className="row g-4 mb-4 mx-3">
            {viewOptions.map((option) => (
              <div key={option.id} className="col-lg-6 col-md-12">
                <div 
                  className="card h-100 shadow-sm hover-shadow transition-all"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleViewSelect(option.id)}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-start gap-3">
                      {/* Icon Section */}
                      <div 
                        className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: 'var(--primary-color-light)',
                          color: 'var(--primary-color)'
                        }}
                      >
                        <i className={`${option.icon} fa-2x`}></i>
                      </div>
                      
                      {/* Content Section */}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title mb-0" style={{ color: 'var(--primary-color)' }}>
                            {option.title}
                          </h5>
                        </div>
                        <p className="card-text text-muted mb-0">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>



          {/* Information Section */}
          <div className="row mt-4 mx-3">
            <div className="col-12">
              <div className="card" style={{ border: '1px solid var(--card-border-light)' }}>
                <div className="card-header" style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)', borderBottom: '2px solid var(--page-header-border)' }}>
                  <h6 className="mb-0">
                    <i className="fas fa-lightbulb me-2"></i>
                    Purchase Requisition Guidelines
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 style={{ color: 'var(--primary-color)' }}>
                        <i className="fas fa-check-circle me-2" style={{ color: 'var(--primary-color)' }}></i>
                        Best Practices:
                      </h6>
                      <ul className="mb-3">
                        <li>Select the appropriate view based on inventory requirements</li>
                        <li>Review items and their current stock levels</li>
                        <li>Verify vendor details before creating requisition</li>
                        <li>Prioritize items below minimum stock level</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6 style={{ color: 'var(--primary-color)' }}>
                        <i className="fas fa-exclamation-triangle me-2" style={{ color: 'var(--primary-color)' }}></i>
                        Important Reminders:
                      </h6>
                      <ul className="mb-0">
                        <li>Items below minimum stock require immediate action</li>
                        <li>Confirm vendor credentials before requisition</li>
                        <li>Reference previous purchase history</li>
                        <li>Review current stock to prevent overstocking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <style>{`
        .central-stores-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }
        
        .central-stores-layout .module-content {
          flex: 1;
          overflow-y: auto;
          height: 100vh;
        }
        
        .central-stores-layout .module-content .container-fluid {
          padding-bottom: 80px !important;
        }
        
        .hover-shadow:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }
        
        .card {
          border-radius: 10px;
        }
        
        .btn {
          border-radius: 6px;
          font-weight: var(--font-weight-medium);
        }
        
        .badge {
          border-radius: 6px;
        }
      `}</style>
    </>
  );
};

export default PrepareOrder;
