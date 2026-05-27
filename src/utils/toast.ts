import { toast, Bounce } from "react-toastify";

const toastErrorBounceDark = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 2200,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
  });
};
const toastSuccessBounceDark = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 2200,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
  });
};
const toastWarningBounceDark = (message: string) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 2200,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
  });
};

export { toastErrorBounceDark, toastSuccessBounceDark, toastWarningBounceDark };
