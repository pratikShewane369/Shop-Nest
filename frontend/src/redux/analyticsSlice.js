import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAdminStats = createAsyncThunk(
    'analytics/fetchAdminStats',
    async (token, { rejectWithValue }) => {
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/analytics`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch admin statistics');
            }

            return await res.json();

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',

    initialState: {
        stats: null,
        loading: false,
        error: null,
        loaded: false
    },

    reducers: {
        clearAnalytics: (state) => {
            state.stats = null;
            state.loaded = false;
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchAdminStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
                state.loaded = true;
            })

            .addCase(fetchAdminStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearAnalytics } = analyticsSlice.actions;

export default analyticsSlice.reducer;