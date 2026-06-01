import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "@/types";

interface AuthState {
  userInfo: IUser | null;
}

const userInfoString = localStorage.getItem("userInfo");
const initialState: AuthState = {
  userInfo: userInfoString ? JSON.parse(userInfoString) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<IUser>) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
