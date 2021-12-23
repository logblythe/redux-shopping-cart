import {
  createSelector,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { checkout, CartItems } from "../../app/api";

import type { AppDispatch, RootState } from "../../app/store";

type CheckoutState = "LOADING" | "ERROR" | "READY" | "NOT_READY";

export interface CartState {
  items: { [productId: string]: number };
  checkoutState: CheckoutState;
  errorMessage: string;
}

const initialState: CartState = {
  items: {},
  checkoutState: "READY",
  errorMessage: "",
};

export const checkoutCart = createAsyncThunk(
  "cart/checkout",
  async (items: CartItems) => {
    const response = await checkout(items);
    return response;
  }
);

/**ACCESS GOBAL STATE INSIDE CREATASYNCTHUNK */
export const checkoutCartWithoutPassingItems = createAsyncThunk(
  "cart/checkout",
  async (_, thunkApi) => {
    const state = thunkApi.getState() as RootState;
    const items = state.cart.items;
    const response = await checkout(items);
    return response;
  }
);

const cartSlice = createSlice({
  name: "cartSlice",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.items[id]) {
        state.items[id]++;
      } else {
        state.items[id] = 1;
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      delete state.items[action.payload];
    },
    updateQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const { id, quantity } = action.payload;
      state.items[id] = quantity;
    },
  },
  extraReducers: function (builder) {
    //Manually adding /pending and /fulfilled
    /**   builder.addCase("cart/checkout/pending", (state, action) => {
       state.checkoutState = "NOT_READY";
     });
     builder.addCase("cart/checkout/fulfilled", (state, action) => {
       state.checkoutState = "READY";
     });
     */
    //pending,fulfilled,rejected are provided by createAsyncThunk
    builder.addCase(checkoutCart.pending, (state, action) => {
      state.checkoutState = "LOADING";
    });
    builder.addCase(
      checkoutCart.fulfilled,
      (state, action: PayloadAction<{ success: boolean }>) => {
        const { success } = action.payload;
        if (success) {
          state.checkoutState = "READY";
          state.items = {};
        } else {
          state.checkoutState = "ERROR";
        }
      }
    );
    builder.addCase(checkoutCart.rejected, (state, action) => {
      state.checkoutState = "ERROR";
      state.errorMessage = action.error.message || "";
    });
  },
});

export function checkoutThunkExporter() {
  return function checkoutThunk(dispatch: AppDispatch) {
    dispatch({ type: "cart/checkout/pending" });
    setTimeout(() => {
      dispatch({ type: "cart/checkout/fulfilled" });
    }, 500);
  };
}

export const getotalCount = (state: RootState) => {
  let count = 0;
  for (let id in state.cart.items) {
    count += state.cart.items[id];
  }
  return count;
};

export const getMemoizedTotalCount = createSelector(
  (state: RootState) => state.cart.items,
  (items) => {
    let count = 0;
    for (let id in items) {
      count += items[id];
    }
    return count;
  }
);

export const getMemoizedTotalPrice = createSelector(
  (state: RootState) => state.cart.items,
  (state: RootState) => state.product.products,
  (items, products) => {
    let totalPrice = 0;
    for (let id in items) {
      totalPrice += products[id].price * items[id];
    }
    return totalPrice.toFixed();
  }
);

export const { addToCart, removeFromCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
