import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../apis/axiosInstance";

// Custom base query
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

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: [
    "Investigations",
    "Appeals",
    "Cases",
    "Contracts",
    "Courts",
    "Departments",
    "Fatwas",
    "Users",
    "Reports",
  ],
  endpoints: (builder) => ({
    // -----------------------------------------
    // Investigations
    // -----------------------------------------
    getInvestigations: builder.query({
      query: (params = {}) => {
        const cleaned = Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== undefined && v !== null && String(v).trim() !== ""
          )
        );
        return { url: "investigations/", params: cleaned };
      },
      providesTags: ["Investigations"],
      keepUnusedDataFor: 300,
    }),

    getInvestigationById: builder.query({
      query: (id) => `investigations/${id}/`,
      providesTags: (result, error, id) => [{ type: "Investigations", id }],
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

    // -----------------------------------------
    // Appeals
    // -----------------------------------------
    getAppeals: builder.query({
      query: (params = {}) => {
        const cleaned = Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== undefined && v !== null && String(v).trim() !== ""
          )
        );
        return { url: "appeals/", params: cleaned };
      },
      providesTags: ["Appeals"],
      keepUnusedDataFor: 300,
    }),

    getAppealById: builder.query({
      query: (id) => `appeals/${id}/`,
      providesTags: (result, error, id) => [{ type: "Appeals", id }],
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

    // -----------------------------------------
    // Cases
    // -----------------------------------------
    getCases: builder.query({
      query: (params = {}) => ({
        url: "cases/",
        params,
      }),
      providesTags: ["Cases"],
      keepUnusedDataFor: 300,
    }),

    getCaseById: builder.query({
      query: (id) => `cases/${id}/`,
      providesTags: (result, error, id) => [{ type: "Cases", id }],
      keepUnusedDataFor: 300,
    }),

    addCase: builder.mutation({
      query: (formData) => ({
        url: "cases/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Cases"],
    }),

    updateCase: builder.mutation({
      query: ({ id, formData }) => ({
        url: `cases/${id}/`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Cases"],
    }),

    // -----------------------------------------
    // Contracts
    // -----------------------------------------
    getContracts: builder.query({
      query: (params = {}) => ({
        url: "contracts/",
        params,
      }),
      providesTags: ["Contracts"],
      keepUnusedDataFor: 300,
    }),

    getContractById: builder.query({
      query: (id) => `contracts/${id}/`,
      providesTags: (result, error, id) => [{ type: "Contracts", id }],
      keepUnusedDataFor: 300,
    }),

    // -----------------------------------------
    // Courts
    // -----------------------------------------
    getCourts: builder.query({
      query: () => ({ url: "courts/" }),
      providesTags: ["Courts"],
      keepUnusedDataFor: 300,
    }),

    // -----------------------------------------
    // Departments
    // -----------------------------------------
    getDepartments: builder.query({
      query: () => ({ url: "departments/" }),
      providesTags: ["Departments"],
      keepUnusedDataFor: 300,
    }),

    // -----------------------------------------
    // Fatwas
    // -----------------------------------------
    getFatwas: builder.query({
      query: (params = {}) => ({
        url: "fatwas/",
        params,
      }),
      providesTags: ["Fatwas"],
      keepUnusedDataFor: 300,
    }),

    getFatwaById: builder.query({
      query: (id) => `fatwas/${id}/`,
      providesTags: (result, error, id) => [{ type: "Fatwas", id }],
      keepUnusedDataFor: 300,
    }),

    // -----------------------------------------
    // Users
    // -----------------------------------------
    getUsers: builder.query({
      query: (params = {}) => ({
        url: "accounts/users/",
        params,
      }),
      providesTags: ["Users"],
      keepUnusedDataFor: 300,
    }),
    addUser: builder.mutation({
      query: (formData) => ({
        url: "accounts/users/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ id, formData }) => ({
        url: `accounts/users/${id}/`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Users"],
    }),

    getUserById: builder.query({
      query: (id) => `accounts/users/${id}/`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
      keepUnusedDataFor: 300,
    }),

    deactivateUser: builder.mutation({
      query: (id) => ({
        url: `accounts/users/${id}/`,
        method: "DELETE",
        body: { is_active: false },
      }),
      invalidatesTags: ["Users"],
    }),

    reactivateUser: builder.mutation({
      query: (id) => ({
        url: `accounts/users/${id}/reactivate/`,
        method: "POST",
        body: { is_active: true },
      }),
      invalidatesTags: ["Users"],
    }),

    // -----------------------------------------
    // Reports
    // -----------------------------------------
    getReportsSummary: builder.query({
      query: () => ({ url: "reports/summary/" }),
      providesTags: ["Reports"],
      keepUnusedDataFor: 300,
    }),

    getReportsCasesByStatus: builder.query({
      query: () => ({ url: "reports/cases_by_status/" }),
      providesTags: ["Reports"],
      keepUnusedDataFor: 300,
    }),

    getReportsContractsByType: builder.query({
      query: () => ({ url: "reports/contracts_by_type/" }),
      providesTags: ["Reports"],
      keepUnusedDataFor: 300,
    }),
  }),
});

// Export hooks
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

  useGetCasesQuery,
  useGetCaseByIdQuery,
  useAddCaseMutation,
  useUpdateCaseMutation,

  useGetContractsQuery,
  useGetContractByIdQuery,

  useGetCourtsQuery,
  useGetDepartmentsQuery,

  useGetFatwasQuery,
  useGetFatwaByIdQuery,

  useGetUsersQuery,
  useAddUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,

  useGetReportsSummaryQuery,
  useGetReportsCasesByStatusQuery,
  useGetReportsContractsByTypeQuery,
} = api;

export default api;
