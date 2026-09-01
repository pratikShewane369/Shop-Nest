import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (token, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/orders/myorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue({
          message: data.message || 'Failed to fetch orders',
          status: res.status
        });
      }

      return data;

    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: 500
      });
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',

  initialState: {
    orders: [],
    loading: false,
    error: null,
    loaded: false
  },

  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.loading = false;
      state.error = null;
      state.loaded = false;
    }
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.loaded = true;
      })

      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearOrders } = orderSlice.actions;

export default orderSlice.reducer;