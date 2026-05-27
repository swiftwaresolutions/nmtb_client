import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { clearSessionLogoutArtifacts } from '../../../utils/sessionLogoutUtil'

interface Login {
    authorized: boolean,
    id: number,
    name: string,
    accessToken: string,
    isDoctor: number
}

const initialState: Login = {
    authorized: false,
    id: 0,
    name: "",
    accessToken: "",
    isDoctor: 0
}
export const loginSlice = createSlice({
    name: 'Login',
    initialState,
    reducers: {
        saveLoginDataAction: (state, { payload }: PayloadAction<Login>) => {
            return { ...state, ...payload, authorized: true }
        },
        authLogout: (state) => {
            clearSessionLogoutArtifacts();
            return { ...state, ...initialState }
        }
    }
})

export const { saveLoginDataAction, authLogout } = loginSlice.actions

export default loginSlice.reducer;