import { toast, ToastOptions, TypeOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "colored", // Using colored theme for better visual distinction
};

// Helper function to ensure a default type if none is provided in options
const ensureType = (options: ToastOptions, type: TypeOptions): ToastOptions => {
  return { ...options, type: options.type || type };
};

export const notify = {
  success: (message: string, options: ToastOptions = {}) => 
    toast.success(message, { ...defaultOptions, ...ensureType(options, 'success') }),
  error: (message: string, options: ToastOptions = {}) => 
    toast.error(message, { ...defaultOptions, ...ensureType(options, 'error') }),
  info: (message: string, options: ToastOptions = {}) => 
    toast.info(message, { ...defaultOptions, ...ensureType(options, 'info') }),
  warn: (message: string, options: ToastOptions = {}) => 
    toast.warn(message, { ...defaultOptions, ...ensureType(options, 'warning') }),
  default: (message: string, options: ToastOptions = {}) =>
    toast(message, { ...defaultOptions, ...ensureType(options, 'default') }),
};
