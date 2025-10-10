import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ToastResponse } from './toast-schemas';

interface ToastState {
  toastOpen: boolean;
  message: string | null;
  warning: string | null;
  error: string | null;
}

const initialState: ToastState = {
  toastOpen: false,
  message: null,
  warning: null,
  error: null,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    setToastOpen(state, action: PayloadAction<ToastResponse>) {
      state.toastOpen = action.payload.isOpen;
      state.message = action.payload.message || null;
      state.warning = action.payload.warning || null;
      state.error = action.payload.error || null;
    },
    clearToast(state) {
      state.toastOpen = false;
      state.message = null;
      state.warning = null;
      state.error = null;
    },
  },
});

export const { setToastOpen, clearToast } = toastSlice.actions;
export default toastSlice.reducer;
