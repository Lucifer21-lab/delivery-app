import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import deliveryReducer from './slices/deliverySlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        delivery: deliveryReducer,
        notification: notificationReducer,
        ui: uiReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});