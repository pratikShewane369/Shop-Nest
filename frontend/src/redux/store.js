import { configureStore } from '@reduxjs/toolkit';

import cartReducer from './cartSlice'; // to store carts
import productReducer from './productSlice'; // to store product in redux
import analyticsReducer from './analyticsSlice'; // admin profile
import orderReducer from './orderSlice'; // user profile

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        products: productReducer,
        analytics: analyticsReducer,
        orders: orderReducer,
    },
});