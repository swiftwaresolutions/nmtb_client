import { createSlice } from "@reduxjs/toolkit";

interface AppSliceInitialStateModel {
  darkTheme: boolean;
}
const initialState: AppSliceInitialStateModel = {
  darkTheme: false,
};

export const appPersistSlice = createSlice({
  name: "appPersistReducer",
  initialState,
  reducers: {
    // setOrganizationDetails: (state, { payload }) => {
    //   state.organization = { name: payload.name, code: payload.code , salesStoreId: payload.salesStoreId};
    // }
    setTheme(state, { payload }) {
      let theme = payload == "dark"
      return { ...state, darkTheme: theme }
    }
  },
});

export const { setTheme } = appPersistSlice.actions;

export default appPersistSlice.reducer;
