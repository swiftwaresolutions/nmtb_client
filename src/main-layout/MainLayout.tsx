import Header from "./header/Header"
import { Outlet, Navigate, useLocation } from "react-router-dom"
import { Fragment, useState, useEffect } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { clearErrorHandling } from "../error/state/error-handle-action"
import { RootState } from "../state/store"
import Footer from "../components/Footer"
import { AppApiService } from "../api/app/app-api-service";
import { setModuleDetails } from "../state/app-reducer/app-slice";

interface MainLayoutProps {
    inactivitySecondsRemaining: number;
}

const MainLayout = ({ inactivitySecondsRemaining }: MainLayoutProps) => {

    const dispatch = useDispatch()
    const location = useLocation()
    const loginUser = useSelector((s: RootState) => s.loginData)
    const moduleDetails = useSelector((s: RootState) => s.appReducer.moduleDetails)
    const appApiService: AppApiService = new AppApiService()

    const [sideView, setSideView] = useState<boolean>(true)
    
    useEffect(() => {
        dispatch(clearErrorHandling())
    }, [])

    useEffect(() => {
        const restoreModuleRights = async () => {
            if (!loginUser?.id || moduleDetails.length > 0) {
                return;
            }

            try {
                const rights = await appApiService.getModulesByUser(loginUser.id);
                dispatch(setModuleDetails(rights));
            } catch (error) {
                console.error('Failed to restore module rights in MainLayout:', error);
            }
        };

        restoreModuleRights();
    }, [loginUser?.id, moduleDetails.length])

    return (
        <Fragment>
            {loginUser ? (
                <div className='main-layout' style={{ 
                    height: '100vh', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden' 
                }}>
                    <Header setSideView={setSideView} inactivitySecondsRemaining={inactivitySecondsRemaining} />
                    
                    <div style={{
                        flex: 1,
                        minHeight: 0,
                        overflow: 'auto',
                        display: 'flex'
                    }}>
                        <Outlet />
                    </div>
                    
                    <Footer />
                </div>
            ) : (
                <Navigate to={`/`} state={{ from: location }} replace />
            )}
        </Fragment>
    )
}

export default MainLayout