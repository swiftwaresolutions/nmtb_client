import { faBars, faHome, faKey, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { Fragment, useState, useEffect } from 'react'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authLogout } from '../../login/components/state/loginSlice'
import himsConfig from '../../himsConfig'
import { useSidebar } from '../../context/SidebarContext'
import './header.css'
import { routerPathNames } from '../../routes/routerPathNames'

interface HeaderProps {
    setSideView: React.Dispatch<React.SetStateAction<boolean>>;
    inactivitySecondsRemaining: number;
}

const Header = ({ setSideView, inactivitySecondsRemaining }: HeaderProps) => {
    const dispatch = useDispatch()
    const { toggleMobileSidebar, toggleSidebar, collapsed } = useSidebar()
    const [isFullscreen, setIsFullscreen] = useState(false)

    const loginData = useSelector((state: any) => state.loginData)

    const navigate = useNavigate()
    const location = useLocation()
    const showInactivityCountdown = loginData?.authorized && inactivitySecondsRemaining > 0 && inactivitySecondsRemaining <= 120

    const formatCountdown = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60

        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    }

    const handleLogOut = () => {
        dispatch(authLogout())
        navigate('/')
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            // Close sidebar when entering fullscreen
            if (!collapsed) {
                toggleSidebar()
            }
            document.documentElement.requestFullscreen().catch((err) => {
                console.error('Error attempting to enable fullscreen:', err)
            })
        } else {
            document.exitFullscreen()
        }
    }

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F11') {
                e.preventDefault()
                toggleFullscreen()
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    // Auto-close sidebar for patient registration and billing pages
    useEffect(() => {
        if (location.pathname === routerPathNames.medicalRecords.registration.patient || location.pathname === routerPathNames.cashCounter.billing.opBilling  || location.pathname === routerPathNames.centralStores.medicalStore.purchase.selectApprovedPO || location.pathname === routerPathNames.centralStores.medicalStore.consumableOrder.create || location.pathname === routerPathNames.centralStores.medicalStore.transferOrder.prepareTransfer || location.pathname === routerPathNames.centralStores.medicalStore.purchase.prepareOrder) {
            // Close sidebar when navigating to these pages
            if (!collapsed) {
                toggleSidebar()
            }
        }
    }, [location.pathname])

    // const handleLogOut = () => {
    //     dispatch(authLogout())
    //     window.location.href = "http://192.168.101:8081/bchon/Index"
    // }

    return (
        <Fragment>
            <Row className="py-2 flex-grow-0 align-items-center app-header">
                <Col style={{color: 'var(--sidebar-text)'}} className="flex-grow-0 d-flex align-items-center gap-3">
                <button 
                    className="mobile-menu-btn d-md-none btn btn-outline-light btn-sm" 
                    onClick={toggleMobileSidebar}
                    aria-label="Toggle Menu"
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <button 
                    className="mobile-menu-btn d-none d-md-block btn btn-outline-light btn-sm border-0" 
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>
                <Link to="/hims/dashboard" className="header-home-link">
                    <FontAwesomeIcon icon={faHome} />
                    <span>Home</span>
                </Link>
                </Col>
                <Col style={{color: 'var(--sidebar-text)'}} className='px-lg-5 fs-17px fw-bold'>
                    {himsConfig.hospitalFullName}
                </Col>
                <Col style={{color: 'var(--sidebar-text)'}} className="text-end">
                    <Row className='align-items-center'>
                        <Col>
                            <div className='header-actions'>
                                <Link style={{color: 'var(--sidebar-text)'}} className='me-3' to="/hims/changepassword" title="Change Password">
                                    <FontAwesomeIcon icon={faKey} />
                                </Link>
                                <button 
                                    style={{color: 'var(--sidebar-text)', textDecoration: 'none'}}
                                    className="btn btn-link p-0 me-3" 
                                    onClick={toggleFullscreen}
                                    title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
                                >
                                    <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
                                </button>
                                <span className='align-middle px-2 curser-pointer text-uppercase fs-14px'>{loginData?.name}</span>
                                {showInactivityCountdown && (
                                    <span className={`logout-countdown${inactivitySecondsRemaining <= 30 ? ' logout-countdown--danger' : ''}`}>
                                        Auto logout in {formatCountdown(inactivitySecondsRemaining)}
                                    </span>
                                )}
                                {/* <Button variant='warning' className='me-2' onClick={() => window.location.href = "http://192.168.1.60:8081/bchon/Index/selection_area.jsp"}>Home</Button> */}
                                <Button className='logout-btn' variant='light' onClick={() => handleLogOut()}>Log Out</Button>
                            </div>

                        </Col>
                    </Row>
                </Col>
            </Row>
        </Fragment>
    )
}

export default Header