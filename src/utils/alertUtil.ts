import Swal from "sweetalert2";

/**
 * Common Alert Utility for HIMS Application
 * Provides consistent alert/notification UI across the application
 */

// Toast notification configuration
const toastConfig = {
  timer: 2000,
  showConfirmButton: false,
  toast: true,
  position: "top-end" as const,
};

// Modal configuration
const modalConfig = {
  confirmButtonColor: "var(--page-primary-color)",
  cancelButtonColor: "#6c757d",
};

/**
 * Show success toast notification
 * @param message - The message to display
 * @param title - Optional title (default: "Success")
 * @param duration - Optional duration in ms (default: 2000)
 */
export const showSuccessToast = (
  message: string,
  title: string = "Success",
  duration: number = 2000
) => {
  Swal.fire({
    ...toastConfig,
    title,
    text: message,
    icon: "success",
    timer: duration,
  });
};

/**
 * Show error toast notification
 * @param message - The message to display
 * @param title - Optional title (default: "Error")
 * @param duration - Optional duration in ms (default: 3000)
 */
export const showErrorToast = (
  message: string,
  title: string = "Error",
  duration: number = 3000
) => {
  Swal.fire({
    ...toastConfig,
    title,
    text: message,
    icon: "error",
    timer: duration,
  });
};

/**
 * Show warning toast notification
 * @param message - The message to display
 * @param title - Optional title (default: "Warning")
 * @param duration - Optional duration in ms (default: 2500)
 */
export const showWarningToast = (
  message: string,
  title: string = "Warning",
  duration: number = 2500
) => {
  Swal.fire({
    ...toastConfig,
    title,
    text: message,
    icon: "warning",
    timer: duration,
  });
};

/**
 * Show info toast notification
 * @param message - The message to display
 * @param title - Optional title (default: "Info")
 * @param duration - Optional duration in ms (default: 2000)
 */
export const showInfoToast = (
  message: string,
  title: string = "Info",
  duration: number = 2000
) => {
  Swal.fire({
    ...toastConfig,
    title,
    text: message,
    icon: "info",
    timer: duration,
  });
};

/**
 * Show success modal (requires user confirmation)
 * @param message - The message to display (can include HTML)
 * @param title - Optional title (default: "Success")
 * @param confirmButtonText - Optional button text (default: "OK")
 */
export const showSuccessModal = (
  message: string,
  title: string = "Success",
  confirmButtonText: string = "OK"
) => {
  const isHtml = /<[a-z][\s\S]*>/i.test(message);

  return Swal.fire({
    title,
    [isHtml ? "html" : "text"]: message,
    icon: "success",
    confirmButtonText,
    ...modalConfig,
    confirmButtonColor: "#28a745",
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};

/**
 * Show error modal (requires user confirmation)
 * @param message - The message to display
 * @param title - Optional title (default: "Error")
 * @param confirmButtonText - Optional button text (default: "OK")
 */
export const showErrorModal = (
  message: string,
  title: string = "Error",
  confirmButtonText: string = "OK"
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "error",
    confirmButtonText,
    confirmButtonColor: "#dc3545",
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};

/**
 * Show warning modal (requires user confirmation)
 * @param message - The message to display
 * @param title - Optional title (default: "Warning")
 * @param confirmButtonText - Optional button text (default: "OK")
 */
export const showWarningModal = (
  message: string,
  title: string = "Warning",
  confirmButtonText: string = "OK"
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    confirmButtonText,
    confirmButtonColor: "#ffc107",
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};

/**
 * Show info modal (requires user confirmation)
 * @param message - The message to display
 * @param title - Optional title (default: "Info")
 * @param confirmButtonText - Optional button text (default: "OK")
 */
export const showInfoModal = (
  message: string,
  title: string = "Info",
  confirmButtonText: string = "OK"
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "info",
    confirmButtonText,
    ...modalConfig,
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};

/**
 * Show confirmation dialog
 * @param message - The message to display
 * @param title - Optional title (default: "Are you sure?")
 * @param confirmButtonText - Optional confirm button text (default: "Yes")
 * @param cancelButtonText - Optional cancel button text (default: "No")
 */
export const showConfirmDialog = (
  message: string,
  title: string = "Are you sure?",
  confirmButtonText: string = "Yes",
  cancelButtonText: string = "No"
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    ...modalConfig,
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};

/**
 * Show confirm dialog with HTML content support
 * @param title - Title of the dialog
 * @param html - HTML content to display
 * @param icon - Optional icon type (default: "question")
 * @param confirmButtonText - Optional confirm button text (default: "Yes")
 * @param cancelButtonText - Optional cancel button text (default: "No")
 * @param confirmButtonColor - Optional confirm button color
 * @param cancelButtonColor - Optional cancel button color
 */
export const showCustomConfirmDialog = (
  title: string,
  html: string,
  icon: "success" | "error" | "warning" | "info" | "question" = "question",
  confirmButtonText: string = "Yes",
  cancelButtonText: string = "No",
  confirmButtonColor: string = "var(--page-primary-color)",
  cancelButtonColor: string = "#6c757d"
) => {
  return Swal.fire({
    title,
    html,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};

/**
 * Show decision dialog with Confirm / Deny / Cancel options
 * @param message - Message to display
 * @param title - Optional title
 * @param icon - Optional icon type (default: "question")
 * @param confirmButtonText - Optional confirm button text
 * @param denyButtonText - Optional deny button text
 * @param cancelButtonText - Optional cancel button text
 * @param confirmButtonColor - Optional confirm button color
 * @param denyButtonColor - Optional deny button color
 * @param cancelButtonColor - Optional cancel button color
 */
export const showDecisionDialog = (
  message: string,
  title: string = "Choose an option",
  icon: "success" | "error" | "warning" | "info" | "question" = "question",
  confirmButtonText: string = "Yes",
  denyButtonText: string = "No",
  cancelButtonText: string = "Cancel",
  confirmButtonColor: string = "var(--page-primary-color)",
  denyButtonColor: string = "#6c757d",
  cancelButtonColor: string = "#dc3545"
) => {
  return Swal.fire({
    title,
    text: message,
    icon,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText,
    denyButtonText,
    cancelButtonText,
    confirmButtonColor,
    denyButtonColor,
    cancelButtonColor,
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};

/**
 * Show loading indicator
 * @param message - Optional loading message (default: "Please wait...")
 */
export const showLoading = (message: string = "Please wait...") => {
  Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Close any open alert/loading
 */
export const closeAlert = () => {
  Swal.close();
};

/**
 * Show validation error modal (displays as warning)
 * @param message - The validation error message
 * @param title - Optional title (default: "Validation Error")
 */
export const showValidationError = (
  message: string,
  title: string = "Validation Error"
) => {
  return Swal.fire({
    title,
    text: message,
    icon: "warning",
    confirmButtonText: "OK",
    backdrop: "static",
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};

/**
 * Show custom alert with HTML content
 * @param html - HTML content to display
 * @param title - Optional title
 * @param icon - Optional icon type
 */
export const showCustomAlert = (
  html: string,
  title?: string,
  icon?: "success" | "error" | "warning" | "info" | "question"
) => {
  return Swal.fire({
    title,
    html,
    icon,
    confirmButtonText: "OK",
    ...modalConfig,
    returnFocus: false,
    focusConfirm: true,
    allowEnterKey: true,
  });
};
