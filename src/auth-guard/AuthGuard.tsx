import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { RootState } from '../state/store';
import { LoginApiService } from '../api/login/login-api-service';
import { StorageService } from '../api/storage/storageService';
import { saveLoginDataAction } from '../login/components/state/loginSlice';
import { authLogout } from '../login/components/state/loginSlice';
import { AppApiService } from '../api/app/app-api-service';
import { setModuleDetails } from '../state/app-reducer/app-slice';

const AuthGuard = ({ component }: any) => {
    const loginData = useSelector((s: RootState) => s.loginData)
    const { moduleDetails } = useSelector((s: RootState) => s.appReducer)
    const loginApiService: LoginApiService = new LoginApiService()
    const storageService: StorageService = new StorageService()
    const appApiService: AppApiService = new AppApiService()
    const [isRestoring, setIsRestoring] = useState(true);

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const getMe = async (): Promise<number> => {
        const response = await loginApiService.getMe()
        if (!response?.success || !response?.data) {
            throw new Error('Unable to restore user session');
        }

        dispatch(saveLoginDataAction(response.data))
        storageService.setToken(response.data.accessToken)
        return response.data.id as number;
    }

    useEffect(() => {
        let isMounted = true;

        const restoreModuleRights = async (userId: number) => {
            if (userId <= 0 || moduleDetails.length > 0) {
                return;
            }

            try {
                const rights = await appApiService.getModulesByUser(userId);
                if (isMounted) {
                    dispatch(setModuleDetails(rights));
                }
            } catch (e) {
                console.error('Failed to restore module rights:', e);
            }
        };

        const restoreSession = async () => {
            const token = storageService.getToken();
            if (!token) {
                setIsRestoring(false);
                navigate('/login', { replace: true });
                return;
            }

            if (loginData?.authorized) {
                await restoreModuleRights(loginData.id);
                setIsRestoring(false);
                return;
            }

            try {
                const userId = await getMe();
                await restoreModuleRights(userId);
            } catch (error) {
                console.log(error);
                dispatch(authLogout());
                navigate('/login', { replace: true });
            } finally {
                if (isMounted) {
                    setIsRestoring(false);
                }
            }
        }

        restoreSession();

        return () => {
            isMounted = false;
        };
    }, [navigate])

    if (isRestoring) {
        return null;
    }

    if (!loginData?.authorized) {
        return <Navigate to="/login" replace />;
    }
    
    return (
        <Fragment>
            <React.Fragment>{component}</React.Fragment>
        </Fragment>
    )


}

export default AuthGuard;