import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as investigationService from "../../services/investigationService";

const initialState = {
  items: [],
  item: null,
  loading: false,
  error: null,
  filters: { number: "", accused: "", complainant: "" },
};

export const fetchInvestigations = createAsyncThunk(
  "investigations/fetchAll",
  async (params, thunkAPI) => {
    try {
      const res = await investigationService.listInvestigations(params);
      return res;
    } catch (err) {
      const data = err.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.detail ||
            data?.message ||
            (data ? JSON.stringify(data) : err.message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchInvestigationById = createAsyncThunk(
  "investigations/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await investigationService.getInvestigation(id);
      return res;
    } catch (err) {
      const data = err.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.detail ||
            data?.message ||
            (data ? JSON.stringify(data) : err.message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createInvestigation = createAsyncThunk(
  "investigations/create",
  async (payload, thunkAPI) => {
    try {
      const res = await investigationService.createInvestigation(payload);
      return res;
    } catch (err) {
      const data = err.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.detail ||
            data?.message ||
            (data ? JSON.stringify(data) : err.message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const investigationSlice = createSlice({
  name: "investigations",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = { number: "", accused: "", complainant: "" };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvestigations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestigations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInvestigations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInvestigationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestigationById.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload;
      })
      .addCase(fetchInvestigationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createInvestigation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvestigation.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createInvestigation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = investigationSlice.actions;
export default investigationSlice.reducer;
