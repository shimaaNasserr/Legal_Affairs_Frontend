import { configureStore } from "@reduxjs/toolkit";
import investigationReducer from "../features/investigations/investigationSlice";
import appealReducer from "../features/appeals/appealSlice";
import { api } from "../services/api";

const store = configureStore({
  reducer: {
    investigations: investigationReducer,
    appeals: appealReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export default store;
