import { configureStore } from "@reduxjs/toolkit";
import investigationReducer from "../features/investigations/investigationSlice";
import appealReducer from "../features/appeals/appealSlice";

const store = configureStore({
  reducer: {
    investigations: investigationReducer,
    appeals: appealReducer,
  },
});

export default store;
