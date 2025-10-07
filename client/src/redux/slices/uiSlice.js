import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebarOpen: false,
    theme: localStorage.getItem('theme') || 'light',
    notifications: {
        enabled: true,
        sound: true
    }
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
        },
        setNotificationSettings: (state, action) => {
            state.notifications = { ...state.notifications, ...action.payload };
        }
    }
});

export const {
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    toggleTheme,
    setNotificationSettings
} = uiSlice.actions;

export default uiSlice.reducer;