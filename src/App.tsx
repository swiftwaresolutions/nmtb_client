import { Fragment, useState, useEffect, useRef  } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./style/main_style.css"
import "./style/predefined.css"
import AppRouter from './routes/AppRouter'
import { useDispatch, useSelector } from "react-redux"

import { ToastContainer } from "react-toastify"
import { authLogout } from "./login/components/state/loginSlice"
import { routerBaseUrl } from "./himsConfig"
import { RootState } from "./state/store"
import { AppApiService } from "./api/app/app-api-service"
import { setOrganizationDetails } from "./state/app-reducer/app-slice"
import { handleError } from "./utils/errorUtil"
import { showWarningToast } from "./utils/alertUtil"

export default function App() {
  const appApiService: AppApiService = new AppApiService();

  const dispatch = useDispatch()
  const auth = useSelector((state: RootState) => state.loginData)
  const [inactivitySecondsRemaining, setInactivitySecondsRemaining] = useState<number>(0)
  const hasShownInactivityWarning = useRef(false)
  
  const getOrganizationDetails = async () => {
    try {
      const resData = await appApiService.fetchOrganizationDetails();
      // console.log(resData);

      if (!resData.name && !resData.code) {
        throw Error("no organization found");
      }
      dispatch(setOrganizationDetails(resData))
    } catch (error) {
      handleError(dispatch, error)
    }
  }
  // const getClinicalModuleDetails = async () => {
  //   try {
  //     const resData: any[] = await appApiService.fetchClinicalModuleDetails();
  //     if (resData.length < 1) return;
  //     dispatch(setClinicalModuleDetails(resData));
  //   } catch (error) {
  //     handleError(dispatch, error)
  //   }
  // }

  useEffect(() => {
    getOrganizationDetails();
    // getClinicalModuleDetails();
  }, [])

  useEffect(() => {
    const isNumberInput = (target: EventTarget | null): target is HTMLInputElement =>
      target instanceof HTMLInputElement && target.type === 'number';

    const handleWheel = (e: WheelEvent) => {
      if (isNumberInput(e.target)) {
        (e.target as HTMLInputElement).blur();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && isNumberInput(e.target)) {
        e.preventDefault();
      }
    };

    const handleFocus = (e: FocusEvent) => {
      if (isNumberInput(e.target)) {
        (e.target as HTMLInputElement).select();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focus', handleFocus, true); // capture phase — focus doesn't bubble
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focus', handleFocus, true);
    };
  }, []);

  useEffect(() => {
    const inactivityTimeoutMs = 1000 * 60 * 30 // 30 minutes
    const warningThresholdSeconds = 120 // 2 minutes
    let intervalId: ReturnType<typeof setInterval> | null = null

    const clearInactivityState = () => {
      sessionStorage.removeItem('expireTime')
      localStorage.removeItem('expireTime')
      setInactivitySecondsRemaining(0)
      hasShownInactivityWarning.current = false
    }

    const updateExpireTime = () => {
      if (!auth.authorized) {
        return
      }

      const expireTime: number = Date.now() + inactivityTimeoutMs
      sessionStorage.setItem('expireTime', `${expireTime}`)
      setInactivitySecondsRemaining(Math.ceil(inactivityTimeoutMs / 1000))
      hasShownInactivityWarning.current = false
    }

    const checkForInactivity = () => {
      if (!auth.authorized) {
        clearInactivityState()
        return
      }

      const expireTimeFromSession = sessionStorage.getItem('expireTime')
      const expireTimeFromLocal = localStorage.getItem('expireTime')
      if (!expireTimeFromSession && expireTimeFromLocal) {
        sessionStorage.setItem('expireTime', expireTimeFromLocal)
        localStorage.removeItem('expireTime')
      }

      const expireTime: number = Number(expireTimeFromSession ?? expireTimeFromLocal ?? 0)
      if (!expireTime) {
        clearInactivityState()
        return
      }

      const remainingSeconds = Math.max(0, Math.ceil((expireTime - Date.now()) / 1000))
      setInactivitySecondsRemaining(remainingSeconds)
      
      if (
        remainingSeconds > 0 &&
        remainingSeconds <= warningThresholdSeconds &&
        !hasShownInactivityWarning.current
      ) {
        showWarningToast(
          'Your session will expire in 2 minutes due to inactivity.',
          'Session Timeout Warning',
          3500
        )
        hasShownInactivityWarning.current = true
      }

      if (remainingSeconds > warningThresholdSeconds) {
        hasShownInactivityWarning.current = false
      }

      if (expireTime <= Date.now()) {
        dispatch(authLogout())
        if (intervalId) {
          clearInterval(intervalId)
        }
        clearInactivityState()
        window.location.href = routerBaseUrl + "/login"
      }
    }

    try {
      if (auth.authorized) {
        updateExpireTime()
        window.addEventListener('click', updateExpireTime)
        window.addEventListener('keydown', updateExpireTime)
        // window.addEventListener('input', updateExpireTime, true)
        // window.addEventListener('scroll', updateExpireTime, true)
        // window.addEventListener('wheel', updateExpireTime, true)
        // window.addEventListener('touchstart', updateExpireTime, true)
        checkForInactivity()
        intervalId = setInterval(() => {
          checkForInactivity()
        }, 1000)
      } else {
        clearInactivityState()
      }
    } catch (error) {
      console.log(error)
    }

    return () => {
      window.removeEventListener('click', updateExpireTime)
      window.removeEventListener('keydown', updateExpireTime)
      // window.removeEventListener('input', updateExpireTime, true)
      // window.removeEventListener('scroll', updateExpireTime, true)
      // window.removeEventListener('wheel', updateExpireTime, true)
      // window.removeEventListener('touchstart', updateExpireTime, true)
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [auth.authorized])

  return (
    <Fragment>
      <ToastContainer />
      <div style={{ height: '100vh', overflow: 'hidden' }}>
        <AppRouter inactivitySecondsRemaining={inactivitySecondsRemaining} />
      </div>
    </Fragment>
  )
}
