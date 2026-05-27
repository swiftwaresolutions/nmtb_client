import { createSlice } from "@reduxjs/toolkit";

interface OrganizationModel {
  name: string;
  code: string;
  salesStoreId:number;
  id: number;
  address: string;
  phoneNo: string;
  description: string;
}

interface MenuHeader {
  headerId: number;
  menuIds: number[];
}

interface SubModule {
  subModId: number;
  headerIds: MenuHeader[];
}

interface Module {
  modId: number;
  subModIds: SubModule[];
}

interface AppSliceInitialStateModel {
  organization: OrganizationModel;
  moduleDetails: Module[];
}
const initialState: AppSliceInitialStateModel = {
  organization: { name: "", code: "", salesStoreId: 0, id: 0, address: "", phoneNo: "" ,description: ""},
  moduleDetails: [],
};

export const appSlice = createSlice({
  name: "appReducer",
  initialState,
  reducers: {
    setOrganizationDetails: (state, { payload }) => {
      state.organization = { name: payload.name, code: payload.code , salesStoreId: payload.salesStoreId, id: payload.id, address: payload.address, phoneNo: payload.phoneNo, description: payload.description};
    },
    setModuleDetails: (state, { payload }) => {
      state.moduleDetails = payload;
    }
  },
});

export const { setOrganizationDetails,setModuleDetails } = appSlice.actions;

export default appSlice.reducer;
