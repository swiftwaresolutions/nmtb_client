import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../state/store';
import { modulesConfig, filterModulesByRights, ModuleConfig } from './config/modules.config';
import { AppApiService } from '../api/app/app-api-service';
import { handleError } from '../utils/errorUtil';
import { useDispatch } from 'react-redux';
import '../style/commonStyle.css';
import { setModuleDetails } from '../state/app-reducer/app-slice';

const SelectionArea: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);

  const [authorizedModules, setAuthorizedModules] = useState<ModuleConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const appApiService: AppApiService = new AppApiService();

  useEffect(() => {
    // Clear module-specific session data when returning to home/dashboard
    sessionStorage.removeItem('pharmacySubModuleData');
    sessionStorage.removeItem('selectedStore');

    const loadModules = async () => {
      setLoading(true);

      try {

        const response = await appApiService.getModulesByUser(loginData.id);
        dispatch(setModuleDetails(response)); 

        const userModuleRights: number[] = response.map((item: { modId: number }) => item.modId);

        const filteredModules = filterModulesByRights(
          modulesConfig,
          userModuleRights,
          loginData.id
        );

        setAuthorizedModules(filteredModules);
      } catch (error: any) {
        console.error('Error loading modules:', error);
        handleError(dispatch, error);
        // Show empty state on error
        setAuthorizedModules([]);
      } finally {
        setLoading(false);
      }
    };

    if (loginData.id) {
      loadModules();
    }
  }, [loginData.id]);

  const handleModuleClick = (authorizedModules: ModuleConfig) => {
    // Check if it's an external URL (http/https)
    if (authorizedModules.isExternal || authorizedModules.link.startsWith('http')) {
      window.location.href = authorizedModules.link;
    }
    // Check if it's a React route (starts with /)
    else if (authorizedModules.link.startsWith('/')) {
      navigate(authorizedModules.link, { state: { moduleId: authorizedModules.id } });
    }
    // Otherwise, it's a legacy JSP link
    else {
      window.location.href = authorizedModules.link;
    }
  };

  if (loading) {
    return (
      <div className="selection-area-login-theme" style={{ 
        minHeight: '100vh',
        padding: '4rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--sa-surface-light) 0%, var(--sa-surface-warm) 60%, var(--sa-accent-soft) 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--sa-dark)', fontSize: '1.1rem', fontWeight: 'var(--font-weight-semibold)' }}>
            Loading modules...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="selection-area-login-theme" style={{ 
      background: 'linear-gradient(135deg, var(--sa-surface-light) 0%, var(--sa-surface-warm) 60%, var(--sa-accent-soft) 100%)',
      minHeight: '100vh',
      padding: '2rem 1rem 3rem',
      width: '100%'
    }}>
      <Container style={{ maxWidth: '100%', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        {/* Page Header Section */}
        <div style={{
          background: 'var(--sa-card-bg)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--sa-card-shadow)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <Row className="align-items-center mx-0">
            <Col lg={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Icon */}
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, var(--sa-accent) 0%, var(--sa-accent-soft) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--sa-accent-shadow-sm)'
                }}>
                  <i className="fas fa-th-large" style={{ fontSize: '1.25rem', color: 'var(--sa-white)' }}></i>
                </div>
                
                {/* Title & Subtitle */}
                <div>
                  <h1 style={{ 
                    fontSize: '1.35rem',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--sa-dark)',
                    marginBottom: '0.15rem',
                    letterSpacing: '-0.3px'
                  }}>
                    Module Selection
                  </h1>
                  <p style={{ 
                    fontSize: '0.85rem',
                    color: 'var(--sa-muted)',
                    marginBottom: 0
                  }}>
                    Welcome, <strong>{loginData.name}</strong>! Select a module to get started
                  </p>
                </div>
              </div>
            </Col>
            
            {/* Stats Section */}
            <Col lg={4} className="text-lg-end mt-2 mt-lg-0">
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, var(--sa-accent) 0%, var(--sa-accent-soft) 100%)',
                color: 'var(--sa-white)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                boxShadow: 'var(--sa-accent-shadow-sm)'
              }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: '0.1rem' }}>
                  Available Modules
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'var(--font-weight-bold)' }}>
                  {authorizedModules.length}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Module Grid Section */}
        {authorizedModules.length > 0 ? (
          <Row className="g-3 mx-0">
            {authorizedModules.map((module, index) => (
              <Col key={module.id} xs={12} sm={6} md={4} lg={3} className="px-2">
                <div
                  onClick={() => handleModuleClick(module)}
                  style={{
                    background: 'var(--sa-card-bg)',
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
                    e.currentTarget.style.boxShadow = 'var(--sa-hover-shadow)';
                    e.currentTarget.style.borderColor = 'var(--sa-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  title={module.description}
                >
                  {/* Background Gradient Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, var(--sa-accent) 0%, var(--sa-accent-soft) 100%)'
                  }}></div>

                  {/* Icon */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: module.iconGradient ?? 'linear-gradient(135deg, var(--sa-accent) 0%, var(--sa-accent-soft) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    boxShadow: 'var(--sa-accent-shadow-md)',
                    transition: 'all 0.3s ease'
                  }}>
                    <i 
                      className={module.iconName} 
                      style={{ 
                        fontSize: '2rem', 
                        color: module.iconColor ?? 'var(--sa-white)'
                      }}
                    ></i>
                  </div>

                  {/* Title */}
                  <h5 style={{
                    fontSize: '1.1rem',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--sa-dark)',
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    {module.title}
                  </h5>

                  {/* Description */}
                  {module.description && (
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--sa-muted)',
                      marginBottom: 0,
                      lineHeight: '1.5'
                    }}>
                      {module.description.length > 60 
                        ? `${module.description.substring(0, 60)}...` 
                        : module.description}
                    </p>
                  )}
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{
            background: 'var(--sa-card-bg)',
            borderRadius: '20px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, var(--sa-surface-light) 0%, var(--sa-surface-warm) 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem',
              fontSize: '4rem'
            }}>
              📋
            </div>
            <h3 style={{ 
              color: 'var(--sa-dark)', 
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '1rem'
            }}>
              No Modules Available
            </h3>
            <p style={{ 
              color: 'var(--sa-muted)',
              fontSize: '1.1rem',
              marginBottom: 0,
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              You currently don't have access to any modules.
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
            font-size: var(--font-size-3xl) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SelectionArea;
