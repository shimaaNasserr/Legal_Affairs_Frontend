import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import { Home } from "../pages/Home/Home";
import { Cases } from "../pages/Cases/Cases";
import ContractsList from "../pages/contracts/ContractsList";
import ContractForm from "../pages/contracts/ContractForm";
import ContractDetails from "../pages/contracts/ContractDetails";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/dashboard/Dashboard";
import FatwasPage from "../pages/fatwas/index";
import ReportsPage from "../pages/reports/index";
import Users from "../pages/users/Users";
import Roles from "../pages/users/Roles";
import Profile from "../pages/users/Profile";

import InvestigationListPage from "../pages/Investigations/InvestigationListPage";
import InvestigationDetailPage from "../pages/Investigations/InvestigationDetailPage";
import InvestigationFormPage from "../pages/Investigations/InvestigationFormPage";

import AppealListPage from "../pages/Appeals/AppealListPage";
import AppealDetailPage from "../pages/Appeals/AppealDetailPage";
import AppealFormPage from "../pages/Appeals/AppealFormPage";

const route = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "home", element: <Home /> },
          { path: "cases", element: <Cases /> },

          // Investigations
          { path: "investigations", element: <InvestigationListPage /> },
          { path: "investigations/new", element: <InvestigationFormPage /> },
          { path: "investigations/:id", element: <InvestigationDetailPage /> },

          // Appeals
          { path: "appeals", element: <AppealListPage /> },
          { path: "appeals/new", element: <AppealFormPage /> },
          { path: "appeals/:id", element: <AppealDetailPage /> },

          // Contracts
          { path: "contracts", element: <ContractsList /> },
          { path: "contracts/:id", element: <ContractDetails /> },

          // Restricted routes
          {
            element: (
              <ProtectedRoute
                allowedRoles={["president", "general_manager", "department_manager"]}
              />
            ),
            children: [
              { path: "contracts/new", element: <ContractForm /> },
              { path: "contracts/:id/edit", element: <ContractForm /> },
            ],
          },

          { path: "fatwas", element: <FatwasPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "users", element: <Users /> },
          { path: "roles", element: <Roles /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
]);

export default route;
