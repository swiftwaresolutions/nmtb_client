import { AxiosError } from "axios";
import { errorHandling } from "../error/state/error-handle-action";

const handleError = (dispatch: (payload: any) => void, error: any) => {
  console.error(error);
  const errorObj = error

  if (error instanceof AxiosError) {
    if (error.response && error.response?.data?.error) {
      // if (error.response?.data?.status == 500) {
      //   error = "Inform to Admin";
      // } else if (error.response?.data?.status == 400) {
      //   error = "Bad Params : " + error.response?.data?.error;
      // } else {
        error = error.response?.data?.error;
      // }
    }
    if (typeof error == "object") {
      error = "Inform To Admin :  " + error
    }
    dispatch(errorHandling(error));
  }
};

export { handleError };
