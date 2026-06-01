import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ICartItem } from "@/types";

interface CartState {
  cartItems: ICartItem[];
  shippingAddress: Record<string, string>;
  paymentMethod: string;
  userId: string | null;
  coupon: { code: string; discount: number } | null;
}

const cartKey = (userId: string | null) =>
  userId ? `de_cart_${userId}` : "de_cart_guest";

const loadItems = (userId: string | null): ICartItem[] => {
  try {
    const raw = localStorage.getItem(cartKey(userId));
    return raw ? (JSON.parse(raw) as ICartItem[]) : [];
  } catch {
    return [];
  }
};

const persistItems = (userId: string | null, items: ICartItem[]) => {
  localStorage.setItem(cartKey(userId), JSON.stringify(items));
};

const initialState: CartState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: "Cash on Delivery",
  userId: null,
  coupon: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initCart: (state, action: PayloadAction<string | null>) => {
      const userId = action.payload;
      state.userId = userId;
      state.cartItems = loadItems(userId);
    },

    addToCart: (state, action: PayloadAction<ICartItem>) => {
      const item = action.payload;
      const existItem = state.cartItems.find(
        (x) => x.productId === item.productId
      );
      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.productId === existItem.productId ? item : x
        );
      } else {
        state.cartItems.push(item);
      }
      persistItems(state.userId, state.cartItems);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.productId !== action.payload
      );
      persistItems(state.userId, state.cartItems);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.cartItems.find(
        (x) => x.productId === action.payload.productId
      );
      if (item) {
        item.quantity = action.payload.quantity;
        persistItems(state.userId, state.cartItems);
      }
    },

    saveShippingAddress: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.shippingAddress = action.payload;
      localStorage.setItem(
        "de_shippingAddress",
        JSON.stringify(action.payload)
      );
    },

    savePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },

    applyCoupon: (
      state,
      action: PayloadAction<{ code: string; discount: number }>
    ) => {
      state.coupon = action.payload;
    },

    removeCoupon: (state) => {
      state.coupon = null;
    },

    clearCartItems: (state) => {
      localStorage.removeItem(cartKey(state.userId));
      state.cartItems = [];
      state.coupon = null;
    },

    resetCart: (state) => {
      state.cartItems = [];
      state.userId = null;
      state.coupon = null;
    },
  },
});

export const {
  initCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  saveShippingAddress,
  savePaymentMethod,
  applyCoupon,
  removeCoupon,
  clearCartItems,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
