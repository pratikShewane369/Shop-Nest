import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/products`
            );

            if (!res.ok) {
                throw new Error('Failed to fetch products');
            }

            return await res.json();

        } catch (error) {
            return rejectWithValue(error.message);
        }
    },
    {
        condition: (_, { getState }) => {
            const { products } = getState();

            if (products.loaded || products.loading) {
                return false;
            }
        }
    }
);

const productSlice = createSlice({
    name: 'products',

    initialState: {
        products: [],
        loading: false,
        error: null,
        loaded: false
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
                state.loaded = true;
            })

            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default productSlice.reducer;