import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { Tuple, configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
// import clinicalPersistReducer from "../clinical-info/redux-store/clinicalPersistSlice";
// import clinicalReducer from "../clinical-info/redux-store/clinicalSlice";
// import clinicalPatientListReducer from "../patient-list/components/state/clinicalPatientListSlice";
import errorHandleReducer from "../error/state/error-handle-reducer";
import loginDataReducer from "../login/components/state/loginSlice";
import { thunk } from "redux-thunk";
import appReducer from "./app-reducer/app-slice";
import appPersistReducer from "./app-reducer/appPersist-slice";

const appReducers = combineReducers({
  loginData: loginDataReducer,
  errorData: errorHandleReducer,
  // clinicalPatientListReducer,
  // clinicalPersistReducer,
  // clinicalReducer,
  appReducer,
  appPersistReducer,
});

const presistConfig = {
  key: "root",
  storage,
  blacklist: ["errorData", "clinicalPatientListReducer", "loginData", "clinicalReducer","appReducer"],
};

const reducer = persistReducer(presistConfig, appReducers);

const store = configureStore({ reducer: reducer, middleware: () => new Tuple(thunk) });

const presistor = persistStore(store);

export { store, presistor };

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
