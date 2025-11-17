import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as appealService from "../../services/appealService";

const initialState = {
  items: [],
  item: null,
  loading: false,
  error: null,
};

export const fetchAppeals = createAsyncThunk(
  "appeals/fetchAll",
  async (params, thunkAPI) => {
    try {
      const res = await appealService.listAppeals(params);
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

export const fetchAppealById = createAsyncThunk(
  "appeals/fetchById",
  async (id, thunkAPI) => {
    try {
      const res = await appealService.getAppeal(id);
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

export const createAppeal = createAsyncThunk(
  "appeals/create",
  async (payload, thunkAPI) => {
    try {
      const res = await appealService.createAppeal(payload);
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

const appealSlice = createSlice({
  name: "appeals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppeals.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAppeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAppealById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppealById.fulfilled, (state, action) => {
        state.loading = false;
        state.item = action.payload;
      })
      .addCase(fetchAppealById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAppeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppeal.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createAppeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default appealSlice.reducer;
