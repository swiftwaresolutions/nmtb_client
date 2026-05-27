import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { PharmacyStoresApiService, SubModuleResponse } from '../api/pharmacy-stores/pharmacy-stores-api-service';
import { routerPathNames } from '../routes/routerPathNames';
import { SidebarProvider } from './context/SidebarContext';
import { Container, Row, Col } from 'react-bootstrap';
import '../style/commonStyle.css';
import { useTableSearch } from '../hooks/useTableSearch';
import SearchInput from '../components/SearchInput';

const PharmacyStoresLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [subModules, setSubModules] = useState<SubModuleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubModule, setSelectedSubModule] = useState<number | null>(null);
  const pharmacyStoresApi = new PharmacyStoresApiService();
  const fetchedModuleIdRef = useRef<number | null>(null);

  const moduleId = (location.state as any)?.moduleId || 3;

  const { filteredData: filteredSubModules, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: subModules,
    searchFields: ['subModName', 'modGroupName'],
  });

   useEffect(() => {
    setSearchTerm('RETAIL');
  }, []);

  const { moduleDetails } = useSelector((state: RootState) => state.appReducer);

  const pharModule = moduleDetails?.find((mod) => mod.modId === moduleId);

  const subModIds = Array.isArray(pharModule?.subModIds ?? []) ? (pharModule?.subModIds ?? []).map((idObj: any) =>
    typeof idObj === 'object' && idObj.subModId !== undefined ? idObj.subModId
      : typeof idObj === 'number' ? idObj : undefined
  ).filter((id: any) => typeof id === 'number') : [];

  // If we're at the base route, show sub-module selection
  const isBaseRoute = location.pathname === routerPathNames.pharmacyStores.base;

  useEffect(() => {
    // Clear central stores context when entering pharmacy flow.
    sessionStorage.removeItem('selectedStore');

    // Clear pharmacy context when leaving pharmacy module.
    return () => {
      sessionStorage.removeItem('pharmacySubModuleData');
    };
  }, []);

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }
    if (!isBaseRoute) {
      setLoading(false);
      return;
    }
    if (fetchedModuleIdRef.current === moduleId) {
      return;
    }
    fetchedModuleIdRef.current = moduleId;
    fetchSubModules();
  }, [loginData.authorized, navigate, moduleId, isBaseRoute]);

  const fetchSubModules = async () => {
    try {
      setLoading(true);
      const response = await pharmacyStoresApi.getSubModules(moduleId);
      
      const filteredSubModules = response.filter((subMod: any) =>
        subModIds.includes(subMod.subModId));

      setSubModules(filteredSubModules);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sub-modules:', error);
      setLoading(false);
    }
  };

  const handleSubModuleClick = (subModule: SubModuleResponse) => {
    setSelectedSubModule(subModule.subModId);

    const storeData = {
      subModId: subModule.subModId,
      subModName: subModule.subModName,
      modGroupId: subModule.modGroupId,
      modGroupName: subModule.modGroupName,
      masterId: subModule.masterId
    };

    // Persist selected pharmacy store context for child pages and refresh-safe flows.
    sessionStorage.setItem('pharmacySubModuleData', JSON.stringify(storeData));

    // All pharmacy sub-modules use the same dashboard with different subModId
    navigate(routerPathNames.pharmacyStores.pharmacy.dashboard, {
      state: storeData
    });
  };

  if (isBaseRoute && loading) {
    return (
      <div style={{ 
        padding: '4rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--page-primary-color)', fontSize: '1.1rem', fontWeight: 'var(--font-weight-semibold)' }}>
            Loading pharmacy stores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {isBaseRoute ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: '2rem 1rem 3rem',
          minHeight: '100%',
          width: '100%'
        }}>
          <Container style={{ maxWidth: '100%', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            {/* Page Header Section */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <Row className="align-items-center mx-0">
                <Col lg={5}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Icon */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, var(--page-primary-color) 0%, var(--page-secondary-color) 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(95, 74, 139, 0.25)'
                    }}>
                      <i className="fas fa-pills" style={{ fontSize: '1.25rem', color: 'var(--page-secondary-color)' }}></i>
                    </div>
                    
                    {/* Title & Subtitle */}
                    <div>
                      <h1 style={{ 
                        fontSize: '1.35rem',
                        fontWeight: 'var(--font-weight-bold)',
                        color: 'var(--page-primary-color)',
                        marginBottom: '0.15rem',
                        letterSpacing: '-0.3px'
                      }}>
                        Pharmacy Stores
                      </h1>
                      <p style={{ 
                        fontSize: '0.85rem',
                        color: '#6c757d',
                        marginBottom: 0
                      }}>
                        Select a pharmacy store to manage
                      </p>
                    </div>
                  </div>
                </Col>

                {/* Search */}
                <Col lg={4} className="mt-2 mt-lg-0">
                  <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search pharmacy stores..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                  />
                </Col>
                
                {/* Stats Section */}
                <Col lg={3} className="text-lg-end mt-2 mt-lg-0">
                  <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, var(--page-primary-color) 0%, var(--page-secondary-color) 100%)',
                    color: 'var(--page-secondary-color)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0 3px 10px rgba(95, 74, 139, 0.25)'
                  }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '0.1rem' }}>
                      Available Stores
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'var(--font-weight-bold)' }}>
                      {subModules.length}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Module Grid Section */}
             {filteredSubModules.length > 0 ? (
              <Row className="g-3 mx-0">
               {filteredSubModules.map((subModule, index) => (
                  <Col key={subModule.subModId} xs={12} sm={6} md={4} lg={3} className="px-2">
                    <div
                      onClick={() => handleSubModuleClick(subModule)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '16px',
                        padding: '2rem 1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '2px solid transparent',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `slideUp 0.5s ease-out ${index * 0.05}s both`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(95, 74, 139, 0.25)';
                        e.currentTarget.style.borderColor = 'var(--page-primary-color)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                      title={subModule.modGroupName}
                    >
                      {/* Background Gradient Overlay */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, var(--page-primary-color) 0%, var(--page-secondary-color) 100%)'
                      }}></div>

                      {/* Icon */}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, var(--page-primary-color) 0%, var(--page-secondary-color) 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem',
                        boxShadow: '0 5px 15px rgba(95, 74, 139, 0.3)',
                        transition: 'all 0.3s ease'
                      }}>
                        <i 
                          className="fas fa-capsules"
                          style={{ 
                            fontSize: '2rem', 
                            color: 'var(--page-secondary-color)'
                          }}
                        ></i>
                      </div>

                      {/* Title */}
                      <h5 style={{
                        fontSize: '1.1rem',
                        fontWeight: 'var(--font-weight-bold)',
                        color: '#2c3e50',
                        marginBottom: '0.5rem',
                        lineHeight: '1.4'
                      }}>
                        {subModule.subModName}
                      </h5>

                      {/* Description */}
                      {subModule.modGroupName && (
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#6c757d',
                          marginBottom: 0,
                          lineHeight: '1.5'
                        }}>
                          {subModule.modGroupName.length > 60 
                            ? `${subModule.modGroupName.substring(0, 60)}...` 
                            : subModule.modGroupName}
                        </p>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e3e7ed 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 2rem',
                  fontSize: '4rem'
                }}>
                  💊
                </div>
                <h3 style={{ 
                  color: 'var(--page-primary-color)', 
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: '1rem'
                }}>
                  No Pharmacy Stores Available
                </h3>
                <p style={{ 
                  color: '#6c757d',
                  fontSize: '1.1rem',
                  marginBottom: 0,
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  You currently don't have access to any pharmacy stores.
                  <br />
                  Please contact your system administrator for assistance.
                </p>
              </div>
            )}
          </Container>

          {/* CSS Animation Styles */}
          <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @media (max-width: 768px) {
              .selection-area-header {
                padding: 1.5rem !important;
              }
              .selection-area-header h1 {
                font-size: 1.5rem !important;
              }
            }
          `}</style>
        </div>
      ) : (
        <Outlet />
      )}
    </SidebarProvider>
  );
};

export default PharmacyStoresLayout;
