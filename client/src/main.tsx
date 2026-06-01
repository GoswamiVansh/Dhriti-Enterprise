import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { store } from "./store/store.ts";
import { initCart } from "./store/slices/cartSlice.ts";

// Initialize cart from localStorage before rendering
const userInfo = localStorage.getItem("userInfo");
const userId = userInfo ? JSON.parse(userInfo)._id : null;
store.dispatch(initCart(userId));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
