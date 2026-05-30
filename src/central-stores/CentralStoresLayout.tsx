import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { routerPathNames } from '../routes/routerPathNames';
import '../style/commonStyle.css';
import { CentralStoresApiService, SubModuleResponse } from '../api/central-stores/central-stores-api-service';
import { useTableSearch } from '../hooks/useTableSearch';
import SearchInput from '../components/SearchInput';
import { Container, Row, Col } from 'react-bootstrap';

const CentralStoresLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [subModules, setSubModules] = useState<SubModuleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubModule, setSelectedSubModule] = useState<number | null>(null);
  const fetchedModuleIdRef = useRef<number | null>(null);

  const {
    filteredData: filteredSubModules,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: subModules,
    searchFields: ["subModName", "modGroupName"],
  });

  const centralStoresApi = new CentralStoresApiService();

  const moduleId = (location.state as any)?.moduleId || 4;

  // If we're at the base route, show sub-module selection
  const isBaseRoute = location.pathname === routerPathNames.centralStores.base;
  const { moduleDetails } = useSelector((state: RootState) => state.appReducer);

  const storeModule = moduleDetails?.find((mod) => mod.modId === moduleId);

  const subModIds = Array.isArray(storeModule?.subModIds ?? []) ? (storeModule?.subModIds ?? []).map((idObj: any) =>
    typeof idObj === 'object' && idObj.subModId !== undefined ? idObj.subModId
      : typeof idObj === 'number' ? idObj : undefined
  ).filter((id: any) => typeof id === 'number') : [];

  const moduleIconGradients = [
    'linear-gradient(135deg, #0d6efd 0%, #20c997 100%)',
    'linear-gradient(135deg, #6610f2 0%, #0dcaf0 100%)',
    'linear-gradient(135deg, #198754 0%, #0dcaf0 100%)',
    'linear-gradient(135deg, #6f42c1 0%, #20c997 100%)'
  ];

  useEffect(() => {
    const state = location.state as {
      subModId?: number;
      subModName?: string;
      modGroupId?: number;
      modGroupName?: string;
      masterId?: number;
    } | null;

    // Clear pharmacy session data when entering central stores flow.
    sessionStorage.removeItem('pharmacySubModuleData');

    // Restore selected store on entry when route state contains a valid store context.
    if (typeof state?.masterId === 'number' && state.masterId > 0) {
      sessionStorage.setItem('selectedStore', JSON.stringify(state));
    }

    // Clear central store context when leaving this module.
    return () => {
      sessionStorage.removeItem('selectedStore');
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
      
      const response = await centralStoresApi.getSubModules(moduleId);
            
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

    // Store selected store information in session storage (single key for all store types)
    const storeData = {
      subModId: subModule.subModId,
      subModName: subModule.subModName,
      modGroupId: subModule.modGroupId,
      modGroupName: subModule.modGroupName,
      masterId: subModule.masterId
    };

    // Clear pharmacy session data to prevent conflicts when switching modules
    sessionStorage.removeItem('pharmacySubModuleData');
    sessionStorage.setItem('selectedStore', JSON.stringify(storeData));

    const moduleSubModIds = Array.isArray(storeModule?.subModIds) ? storeModule?.subModIds ?? [] : [];

    const selectedSubModuleAuth = moduleSubModIds.find((entry: any) => entry?.subModId === subModule.subModId);

    const hasMedicalHeader = Array.isArray((selectedSubModuleAuth as any)?.headerIds)
      ? ((selectedSubModuleAuth as any).headerIds as any[]).some((header: any) => Number(header?.headerId) === 31)
      : false;

    const isMedicalStore = hasMedicalHeader || subModule.subModId === 4;

    // Route by authorized header mapping instead of store name text.
    if (isMedicalStore) {
      navigate('medical-store', {
        state: storeData
      });
    } else {
      navigate('non-medical-store', {
        state: storeData
      });
    }
  };

  const handleBackToModules = () => {
    // Clear store information from session when going back to home
    sessionStorage.removeItem('selectedStore');
    navigate(routerPathNames.hims.dashboard);
  };

  if (isBaseRoute && loading) {
    return (
      <div className="content-body selection-area-login-theme" style={{
        flex: 1,
        overflow: 'auto',
        width: '100%',
        minHeight: '100%',
        padding: '4rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--sa-surface-light) 75%, var(--sa-surface-warm) 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--page-primary-color)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
            Loading central stores...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isBaseRoute ? (
        <div className="content-body selection-area-login-theme" style={{
          flex: 1,
          overflow: 'auto',
          width: '100%',
          background: 'linear-gradient(180deg, var(--sa-surface-light) 75%, var(--sa-surface-warm) 100%)',
          padding: '2rem 1rem 3rem',
          minHeight: '100%'
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
                <Col lg={8}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Icon */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #0d6efd 0%, #20c997 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(13, 110, 253, 0.25)'
                    }}>
                      <i className="fas fa-warehouse" style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--bg-white)' }}></i>
                    </div>
                    
                    {/* Title & Subtitle */}
                    <div>
                      <h1 style={{ 
                        fontSize: 'calc(var(--font-size-2xl) * 1.08)',
                        fontWeight: 'var(--font-weight-bold)',
                        color: '#f76301',
                        marginBottom: '0.15rem',
                        letterSpacing: '-0.3px'
                      }}>
                        Central Stores
                      </h1>
                      <p style={{ 
                        fontSize: 'var(--font-size-sm)',
                        color: '#030303',
                        marginBottom: 0
                      }}>
                        Select a store to manage inventory and operations
                      </p>
                    </div>
                  </div>
                </Col>
                
                {/* Stats Section */}
                <Col lg={4} className="text-lg-end mt-2 mt-lg-0">
                  <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #ff5e00 0%, #ff9f43 100%)',
                    color: 'var(--bg-white)',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    boxShadow: '0 3px 10px rgba(255, 94, 0, 0.28)'
                  }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-medium)', opacity: 0.9, marginBottom: '0.1rem', color: 'var(--bg-white)' }}>
                      Available Stores
                    </div>
                    <div style={{ fontSize: 'calc(var(--font-size-2xl) * 1.12)', fontWeight: 'var(--font-weight-bold)' }}>
                      {subModules.length}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Search Section */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <div style={{ width: '100%', maxWidth: '600px' }}>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search stores by name or type..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                />
              </div>
            </div>

            {/* Module Grid Section */}
            {subModules.length === 0 && !searchTerm ? (
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
                  fontSize: 'calc(var(--font-size-4xl) * 2.133)'
                }}>
                  📋
                </div>
                <h3 style={{ 
                  color: 'var(--page-primary-color)', 
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: '1rem'
                }}>
                  No Central Stores Available
                </h3>
                <p style={{ 
                  color: '#6c757d',
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: 0,
                  maxWidth: '500px',
                  margin: '0 auto'
                }}>
                  You currently don't have access to any central stores.
                  <br />
                  Please contact your system administrator for assistance.
                </p>
              </div>
            ) : filteredSubModules.length === 0 && searchTerm ? (
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
                  fontSize: 'calc(var(--font-size-4xl) * 2.133)'
                }}>
                  🔍
                </div>
                <h3 style={{ 
                  color: 'var(--page-primary-color)', 
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: '1rem'
                }}>
                  No Results Found
                </h3>
                <p style={{ 
                  color: '#6c757d',
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: 0
                }}>
                  No stores found for "{searchTerm}".
                  <br />
                  Try adjusting your search terms.
                </p>
              </div>
            ) : (
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
                        background: 'linear-gradient(90deg, #ffe0b2 0%, #ffb74d 100%)'
                      }}></div>

                      {/* Icon */}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: moduleIconGradients[index % moduleIconGradients.length],
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem',
                        boxShadow: '0 8px 20px rgba(255, 183, 77, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.65) inset',
                        transition: 'all 0.3s ease'
                      }}>
                        <i 
                          className={subModule.modGroupName.toLowerCase().includes('medical') ? 'fas fa-pills' : 'fas fa-box'}
                          style={{ 
                            fontSize: 'calc(var(--font-size-4xl) * 1.067)', 
                            color: 'var(--bg-white)'
                          }}
                        ></i>
                      </div>

                      {/* Title */}
                      <h5 style={{
                        fontSize: 'var(--font-size-lg)',
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
                          fontSize: 'var(--font-size-sm)',
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
                font-size: var(--font-size-3xl) !important;
              }
            }
          `}</style>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default CentralStoresLayout;
