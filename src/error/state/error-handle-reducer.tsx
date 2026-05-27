const errorHandleReducer = (state: any[] = [], action: any) => {
    switch (action.type) {
        case "HANDLE_ERROR":
            state = [...state, action.payload]
            return state;
        case "CLEAR_ERROR":
            state = []
            return state;
        case "DELETE_CURRENT_ERROR":
            state = state.filter((message:any,m_idx:number)=>m_idx!=action.payload)
            return state;
        default:
            return state;
    }
}
export default errorHandleReducer;