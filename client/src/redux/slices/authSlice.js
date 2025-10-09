import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authAPI from '../../api/auth.api';

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(credentials);
            localStorage.setItem('token', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authAPI.register(userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Registration failed');
        }
    }
);

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async (verificationData, { rejectWithValue }) => {
        try {
            const response = await authAPI.verifyEmail(verificationData);
            localStorage.setItem('token', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Verification failed');
        }
    }
);

export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.getCurrentUser();
            return response.data.data.user;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/update-profile',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authAPI.updateProfile(data);
            return response.data.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    loading: false,
    error: null,
    registrationStatus: 'idle',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.user = action.payload.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.registrationStatus = 'pending';
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
                state.registrationStatus = 'succeeded';
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.registrationStatus = 'failed';
            })
            .addCase(verifyEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.token = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.user = action.payload.user;
                state.registrationStatus = 'idle';
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(loadUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loadUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    }
});

export const { logout, clearError, setUser } = authSlice.actions;

// This is the line that was likely missing
export default authSlice.reducer;