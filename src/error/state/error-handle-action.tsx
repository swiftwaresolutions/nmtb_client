export const errorHandling = (error: any) => {
    return {
        type: "HANDLE_ERROR",
        payload: error
    }
}
export const clearErrorHandling = () => {
    return {
        type: "CLEAR_ERROR",
        payload: null
    }
}
export const deleteCurrentError = (idx:number) => {
    return {
        type: "DELETE_CURRENT_ERROR",
        payload: idx
    }
}