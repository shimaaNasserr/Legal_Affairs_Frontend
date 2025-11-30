import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../apis/axiosInstance";

// Custom base query using axios instance for authentication
const baseQuery = async (args, api, extraOptions) => {
  try {
    const result = await axiosInstance({
      url: args.url || args,
      method: args.method || "GET",
      data: args.body,
      params: args.params,
      ...extraOptions,
    });
    return { data: result.data };
  } catch (axiosError) {
    const err = {
      status: axiosError.response?.status,
      data: axiosError.response?.data || axiosError.message,
    };
    return { error: err };
  }
};

// Create API service with caching
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: ["Investigations", "Appeals"],
  endpoints: (builder) => ({
    // Investigations endpoints
    getInvestigations: builder.query({
      query: (params = {}) => {
        const cleaned = Object.fromEntries(
          Object.entries(params || {}).filter(
            ([_, v]) => v !== undefined && v !== null && String(v).trim() !== ""
          )
        );
        return {
          url: "investigations/",
          params: cleaned,
        };
      },
      providesTags: ["Investigations"],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),
    getInvestigationById: builder.query({
      query: (id) => `investigations/${id}/`,
      providesTags: (result, error, id) => [{ type: "Investigations", id }],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),
    createInvestigation: builder.mutation({
      query: (formData) => ({
        url: "investigations/",
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["Investigations"],
    }),
    updateInvestigation: builder.mutation({
      query: ({ id, formData }) => ({
        url: `investigations/${id}/`,
        method: "PUT",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Investigations",
        { type: "Investigations", id },
      ],
    }),
    deleteInvestigation: builder.mutation({
      query: (id) => ({
        url: `investigations/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Investigations"],
    }),

    // Appeals endpoints
    getAppeals: builder.query({
      query: (params = {}) => ({
        url: "appeals/",
        params,
      }),
      providesTags: ["Appeals"],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),
    getAppealById: builder.query({
      query: (id) => `appeals/${id}/`,
      providesTags: (result, error, id) => [{ type: "Appeals", id }],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),
    createAppeal: builder.mutation({
      query: (formData) => ({
        url: "appeals/",
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["Appeals"],
    }),
    updateAppeal: builder.mutation({
      query: ({ id, formData }) => ({
        url: `appeals/${id}/`,
        method: "PUT",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Appeals",
        { type: "Appeals", id },
      ],
    }),
    deleteAppeal: builder.mutation({
      query: (id) => ({
        url: `appeals/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Appeals"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetInvestigationsQuery,
  useGetInvestigationByIdQuery,
  useCreateInvestigationMutation,
  useUpdateInvestigationMutation,
  useDeleteInvestigationMutation,
  useGetAppealsQuery,
  useGetAppealByIdQuery,
  useCreateAppealMutation,
  useUpdateAppealMutation,
  useDeleteAppealMutation,
} = api;
