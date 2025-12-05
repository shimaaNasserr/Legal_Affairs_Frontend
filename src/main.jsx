import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App";
import store from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
      <GoogleOAuthProvider clientId="27745971984-4on0d4ori47ore60b1u11heoecujnd16.apps.googleusercontent.com">

    <Provider store={store}>
      <AuthProvider>

        <App />

      </AuthProvider>
    </Provider>
              </GoogleOAuthProvider>

  </React.StrictMode>
);
