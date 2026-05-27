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

const Login = () => {

  const loginUser = useSelector((s: RootState) => s.loginData);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loginApiService: LoginApiService = new LoginApiService()
  const storageService: StorageService = new StorageService()
  const [user, setUser] = useState({ userName: "", password: "" })
  const [errorMessage, setErrorMessage] = useState("")

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
        background: 'linear-gradient(135deg, var(--page-primary-color) 0%, var(--page-secondary-color) 50%, var(--page-secondary-color) 100%)'
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
                      background: 'linear-gradient(135deg, var(--page-primary-color) 0%, var(--page-secondary-color) 100%)',
                      height: '100%',
                      padding: '3rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'var(--page-secondary-color)',
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
                        <i className="fas fa-hospital" style={{ fontSize: '4rem', color: 'var(--page-secondary-color)' }}></i>
                      </div>

                      {/* Branding Text */}
                      <h2 style={{ 
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: '1rem',
                        lineHeight: '1.3',
                        color: 'var(--page-secondary-color)'
                      }}>
                        NIGHTINGALE
                      </h2>
                      <p style={{ 
                        fontSize: '1.1rem',
                        textAlign: 'center',
                        opacity: 0.95,
                        marginBottom: 0,
                        color: 'var(--page-secondary-color)'
                      }}>
                        {himsConfig.hospitalFullName}
                      </p>
                    </div>
                  </Col>

                  {/* Right Side - Login Form */}
                  <Col lg={6}>
                    <div style={{ padding: '3rem 2.5rem', background: 'rgba(255, 255, 255, 0.98)', height: '100%' }}>
                      {/* Mobile Header */}
                      <div className="d-lg-none text-center mb-4">
                        <div style={{
                          width: '80px',
                          height: '80px',
                          background: 'var(--page-primary-color)',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '1rem'
                        }}>
                          <i className="fas fa-hospital" style={{ fontSize: '2.5rem', color: 'var(--page-secondary-color)' }}></i>
                        </div>
                        <h3 style={{ color: 'var(--page-primary-color)', fontWeight: '700', marginBottom: '0.5rem' }}>
                          HIMS
                        </h3>
                        <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: 0 }}>
                          {himsConfig.hospitalFullName}
                        </p>
                      </div>

                      {/* Login Header */}
                      <div className="text-center text-lg-start mb-4">
                        <h3 style={{ 
                          color: 'var(--page-secondary-color)', 
                          fontWeight: '700',
                          fontSize: '2rem',
                          marginBottom: '0.5rem'
                        }}>
                          Welcome Back
                        </h3>
                        <p style={{ color: '#6c757d', fontSize: '1rem' }}>
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
                          <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '0.5rem' }}>
                            Username
                          </Form.Label>
                          <div style={{ position: 'relative' }}>
                            <i className="fas fa-user" style={{
                              position: 'absolute',
                              left: '15px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#6c757d',
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
                              onFocus={(e) => e.target.style.borderColor = 'var(--page-primary-color)'}
                              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                            />
                          </div>
                        </Form.Group>

                        {/* Password Field */}
                        <Form.Group className="mb-4">
                          <Form.Label style={{ fontWeight: '600', color: '#495057', marginBottom: '0.5rem' }}>
                            Password
                          </Form.Label>
                          <div style={{ position: 'relative' }}>
                            <i className="fas fa-lock" style={{
                              position: 'absolute',
                              left: '15px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#6c757d',
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
                              onFocus={(e) => e.target.style.borderColor = 'var(--page-primary-color)'}
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
                            background: 'var(--page-primary-color)',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: 'var(--page-secondary-color)',
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
                        <small style={{ color: '#6c757d' }}>
                          <i className="fas fa-shield-alt me-1"></i>
                          Secure login protected by encryption
                        </small>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Copyright Footer */}
              <div className="text-center mt-4">
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '10px',
                  padding: '0.75rem 1.5rem',
                  display: 'inline-block',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <p style={{ 
                    color: '#fff', 
                    fontSize: '0.9rem', 
                    marginBottom: 0, 
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    fontWeight: '500'
                  }}>
                    © {new Date().getFullYear()} Swiftware Solutions. All rights reserved.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  )
}

export default Login
