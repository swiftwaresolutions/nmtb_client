import React, { Fragment, useState, useEffect } from 'react'
import { Col, Row, Form, Button, Container } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoginApiService } from '../api/login/login-api-service'
import { useDispatch, useSelector } from 'react-redux'
import { StorageService } from '../api/storage/storageService'
import { saveLoginDataAction } from './components/state/loginSlice'
import { authLogout } from './components/state/loginSlice'
import { RootState } from '../state/store'
import { routerPathNames } from '../routes/routerPathNames'
import himsConfig from '../himsConfig'
import logoImage from '../components/logo-1.jpg'
import { AppApiService } from '../api/app/app-api-service'

const Login = () => {
  const brandAccent = '#f75d00'
  const brandAccentSoft = '#ff8a3d'
  const brandDark = '#232323'
  const brandWhite = '#ffffff'
  const brandMuted = 'rgba(35, 35, 35, 0.72)'
  const brandSurfaceLight = '#fff6ef'
  const brandSurfaceWarm = '#ffe4d1'

  const loginUser = useSelector((s: RootState) => s.loginData);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loginApiService: LoginApiService = new LoginApiService()
  const storageService: StorageService = new StorageService()
  const [user, setUser] = useState({ userName: "", password: "" })
  const [errorMessage, setErrorMessage] = useState("")
  const [organizationName, setOrganizationName] = useState(himsConfig.hospitalFullName)

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setUser((pre: any) => ({ ...pre, [name]: value }))
  }

  const handleLogin = async (e: any) => {
    try {
      e.preventDefault();
      dispatch(authLogout())
      const response = await loginApiService.loginUser(user)
      if (response?.success) {
        dispatch(saveLoginDataAction(response?.data))
        storageService.setToken(response?.data?.accessToken)
        storageService.setRoleId(response?.data?.roleId)
        navigate(routerPathNames.hims.dashboard)
      } else {
        setErrorMessage(response?.data?.error || "Login failed");
      }
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        setErrorMessage("Network error");
      } else {
        setErrorMessage(error?.response?.data?.error);
      }
      console.log(error)
    }
  };

  useEffect(() => {
    if (loginUser.authorized && storageService.getToken()) {
      navigate(routerPathNames.hims.dashboard)
    }
  }, [loginUser]);

  useEffect(() => {
    const getOrganizationDetails = async () => {
      try {
        const appApiService: AppApiService = new AppApiService()
        const response = await appApiService.fetchOrganizationDetails()
        if (response?.name) {
          setOrganizationName(response.name)
        }
      } catch (error) {
        console.log(error)
      }
    }

    getOrganizationDetails()
  }, [])

  
  return (
    <Fragment>
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${brandSurfaceLight} 0%, ${brandSurfaceWarm} 60%, ${brandAccentSoft} 100%)`
      }}>

        {/* Login Container */}
        <Container style={{ position: 'relative', zIndex: 1, maxWidth: '1200px' }}>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              {/* Login Card */}
              <div style={{
                background: 'transparent',
                borderRadius: '20px',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
                border: 'none'
              }}>
                <Row className="g-0">
                  {/* Left Side - Branding */}
                  <Col lg={6} className="d-none d-lg-block">
                    <div style={{
                      background: `linear-gradient(135deg, ${brandAccent} 0%, ${brandAccentSoft} 100%)`,
                      height: '100%',
                      padding: '3rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: brandWhite,
                      position: 'relative'
                    }}>
                      {/* Logo/Icon */}
                      <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem',
                        border: '3px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <img
                          src={logoImage}
                          alt="Hospital logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>

                      {/* Branding Text */}
                      <h2 style={{ 
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        lineHeight: '1.3',
                        color: brandWhite
                      }}>
                        {organizationName}
                      </h2>
                    </div>
                  </Col>

                  {/* Right Side - Login Form */}
                  <Col lg={6}>
                    <div style={{ padding: '3rem 2.5rem', background: '#fffdfb', height: '100%' }}>
                      {/* Mobile Header */}
                      <div className="d-lg-none text-center mb-4">
                        <div style={{
                          width: '80px',
                          height: '80px',
                          background: brandAccent,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem'
                        }}>
                          <img
                            src={logoImage}
                            alt="Hospital logo"
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <h3 style={{ color: brandDark, fontWeight: '700', marginBottom: '0.5rem' }}>
                          HIMS
                        </h3>
                        <p style={{ color: brandMuted, fontSize: '0.9rem', marginBottom: 0 }}>
                          {organizationName}
                        </p>
                      </div>

                      {/* Login Header */}
                      <div className="text-center text-lg-start mb-4">
                        <h3 style={{ 
                          color: brandDark, 
                          fontWeight: '700',
                          fontSize: '2rem',
                          marginBottom: '0.5rem'
                        }}>
                          Welcome Back
                        </h3>
                        <p style={{ color: brandMuted, fontSize: '1rem' }}>
                          Please login to continue
                        </p>
                      </div>

                      {/* Error Message */}
                      {errorMessage && (
                        <div style={{
                          background: '#fee',
                          border: '1px solid #fcc',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          marginBottom: '1.5rem',
                          color: '#c33'
                        }}>
                          <i className="fas fa-exclamation-circle me-2"></i>
                          {errorMessage}
                        </div>
                      )}

                      {/* Login Form */}
                      <Form onSubmit={handleLogin}>
                        {/* Username Field */}
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: '600', color: brandDark, marginBottom: '0.5rem' }}>
                            Username
                          </Form.Label>
                          <div style={{ position: 'relative' }}>
                            <i className="fas fa-user" style={{
                              position: 'absolute',
                              left: '15px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: brandMuted,
                              fontSize: '1.1rem'
                            }}></i>
                            <Form.Control
                              type="text"
                              placeholder="Enter your username"
                              name="userName"
                              value={user?.userName}
                              onChange={handleChange}
                              autoFocus
                              required
                              style={{
                                paddingLeft: '45px',
                                height: '50px',
                                border: '2px solid #e9ecef',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                              }}
                              onFocus={(e) => e.target.style.borderColor = brandAccent}
                              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            />
                          </div>
                        </Form.Group>

                        {/* Password Field */}
                        <Form.Group className="mb-4">
                          <Form.Label style={{ fontWeight: '600', color: brandDark, marginBottom: '0.5rem' }}>
                            Password
                          </Form.Label>
                          <div style={{ position: 'relative' }}>
                            <i className="fas fa-lock" style={{
                              position: 'absolute',
                              left: '15px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: brandMuted,
                              fontSize: '1.1rem'
                            }}></i>
                            <Form.Control
                              type="password"
                              placeholder="Enter your password"
                              name="password"
                              value={user?.password}
                              onChange={handleChange}
                              required
                              style={{
                                paddingLeft: '45px',
                                height: '50px',
                                border: '2px solid #e9ecef',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                transition: 'all 0.3s'
                              }}
                              onFocus={(e) => e.target.style.borderColor = brandAccent}
                              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            />
                          </div>
                        </Form.Group>

                        {/* Login Button */}
                        <Button
                          type="submit"
                          style={{
                            width: '100%',
                            height: '50px',
                            background: `linear-gradient(135deg, ${brandAccent} 0%, ${brandAccentSoft} 100%)`,
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: brandWhite,
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                          }}
                        >
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Login
                        </Button>
                      </Form>

                      {/* Footer Note */}
                      <div className="text-center mt-4">
                        <small style={{ color: brandMuted }}>
                          <i className="fas fa-shield-alt me-1"></i>
                          Secure login protected by encryption
                        </small>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

            </Col>
          </Row>
        </Container>

        {/* Copyright Footer */}
        <div
          style={{
            position: 'absolute',
            right: '20px',
            bottom: '16px',
            zIndex: 5,
            textAlign: 'right'
          }}
        >
          <p
            style={{
              color: brandWhite,
              fontSize: 'var(--font-size-sm)',
              marginBottom: 0,
              fontWeight: 'var(--font-weight-medium)'
            }}
          >
            © {new Date().getFullYear()} Swiftware Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </Fragment>
  )
}

export default Login
