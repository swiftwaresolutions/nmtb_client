import { createSlice } from "@reduxjs/toolkit";

interface AppSliceInitialStateModel {
  darkTheme: boolean;
}
const initialState: AppSliceInitialStateModel = {
  darkTheme: false,
};
interface OrganizationDetails {
  name: string;
  code: string;
  salesStoreId: string;
}

interface AppSliceInitialStateModel {
  darkTheme: boolean;
  organization?: OrganizationDetails;
}

export const appPersistSlice = createSlice({
  name: "appPersistReducer",
  initialState,
  reducers: {
    setOrganizationDetails: (state, { payload }) => {
      state.organization = { name: payload.name, code: payload.code , salesStoreId: payload.salesStoreId};
      console.log("Organization details set in appPersistReducer:", state.organization.name);
    return {...state , organization: { name: payload.name, code: payload.code , salesStoreId: payload.salesStoreId}};
    },
    setTheme(state, { payload }) {
      let theme = payload == "dark"
      return { ...state, darkTheme: theme }
    }
  },
});

export const { setTheme, setOrganizationDetails } = appPersistSlice.actions;


export default appPersistSlice.reducer;
