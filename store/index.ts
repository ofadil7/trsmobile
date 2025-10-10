import { configureStore } from '@reduxjs/toolkit';
import authSliceReducer from './features/authentification/authSlice';
import chatMessagesSlice from './features/chatMessages/chatMessagesSlice';
import membersSlice from './features/members/membersSlice';
import notificationSliceReducer from './features/notifications/notificationsSlice';
import portersSlice from './features/porters/portersSlice';
import workRouteSlice from './features/routesDeTravail/routesDeTravailSlice';
import ticketsReducer from './features/tickets/ticketsSlice';
import toastReducer from './features/toast/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    notifications: notificationSliceReducer,
    chatMessages: chatMessagesSlice,
    members: membersSlice,
    tickets: ticketsReducer,
    porters: portersSlice,
    workRoute: workRouteSlice,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
