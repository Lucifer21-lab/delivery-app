import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as deliveryAPI from '../../api/delivery.api';

export const fetchAvailableDeliveries = createAsyncThunk(
    'delivery/fetchAvailable',
    async (params, { rejectWithValue }) => {
        try {
            const response = await deliveryAPI.getAvailableDeliveries(params);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

export const fetchMyDeliveries = createAsyncThunk(
    'delivery/fetchMy',
    async (type, { rejectWithValue }) => {
        try {
            const response = await deliveryAPI.getMyDeliveries(type);
            return response.data.data.deliveries;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

export const fetchDeliveryById = createAsyncThunk(
    'delivery/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await deliveryAPI.getDeliveryById(id);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

export const createDelivery = createAsyncThunk(
    'delivery/create',
    async (deliveryData, { rejectWithValue }) => {
        try {
            const response = await deliveryAPI.createDelivery(deliveryData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

export const acceptDelivery = createAsyncThunk(
    'delivery/accept',
    async (deliveryId, { rejectWithValue }) => {
        try {
            const response = await deliveryAPI.acceptDelivery(deliveryId);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

export const updateDeliveryStatus = createAsyncThunk(
    'delivery/updateStatus',
    async ({ deliveryId, status }, { rejectWithValue }) => {
        try {
            const response = await deliveryAPI.updateDeliveryStatus(deliveryId, status);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

export const deleteMyDelivery = createAsyncThunk(
    'delivery/deleteMyDelivery',
    async (deliveryId, { rejectWithValue }) => {
        try {
            await deliveryAPI.deleteMyRequest(deliveryId);
            return deliveryId; // Return the ID on success
        } catch (error) {
            return rejectWithValue(error.response?.data?.error);
        }
    }
);

const initialState = {
    availableDeliveries: [],
    myDeliveries: [],
    currentDelivery: null,
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1
};

const deliverySlice = createSlice({
    name: 'delivery',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentDelivery: (state, action) => {
            state.currentDelivery = action.payload;
        },
        clearCurrentDelivery: (state) => {
            state.currentDelivery = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAvailableDeliveries.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAvailableDeliveries.fulfilled, (state, action) => {
                state.loading = false;
                state.availableDeliveries = action.payload.deliveries;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchAvailableDeliveries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyDeliveries.fulfilled, (state, action) => {
                state.myDeliveries = action.payload;
            })
            .addCase(fetchDeliveryById.fulfilled, (state, action) => {
                state.currentDelivery = action.payload;
            })
            .addCase(createDelivery.fulfilled, (state, action) => {
                state.myDeliveries.unshift(action.payload);
            })
            .addCase(acceptDelivery.fulfilled, (state, action) => {
                state.availableDeliveries = state.availableDeliveries.filter(
                    d => d._id !== action.payload._id
                );
                state.myDeliveries.unshift(action.payload);
            })
            .addCase(deleteMyDelivery.fulfilled, (state, action) => {
                // Remove the deleted delivery from the state
                state.myDeliveries = state.myDeliveries.filter(
                    d => d._id !== action.payload
                );
            });
    }
});

export const { clearError, setCurrentDelivery, clearCurrentDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;