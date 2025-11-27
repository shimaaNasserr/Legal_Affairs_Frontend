import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import { Home } from "../pages/Home/Home";
import Cases from "../pages/Cases/Cases";
import SelectCourt from "../pages/Courts/SelectCourt";
import AddCaseForm from "../pages/Cases/AddCaseForm";
import CaseDetails from "../pages/Cases/CaseDetails";
import Investigations from "../pages/Investigations/Investigations";
import Appeals from "../pages/Appeals/Appeals";
import Contracts from "../pages/Contracts/Contracts";
import Fatwas from "../pages/Fatwas/Fatwas";
import Reports from "../pages/Reports/Reports";
import Users from "../pages/Users/Users";
import Profile from "../pages/Profile/Profile";
import ProtectedRoute from "../components/ProtectedRoute";
import { ROLES } from "../utils/roles";

const route = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "home", element: <Home /> },
          { path: "cases", element: <Cases /> },
          { path: "cases/add/form", element: <AddCaseForm /> },

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

          // Other pages
          { path: "fatwas", element: <FatwasPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "users", element: <Users /> },
          { path: "roles", element: <Roles /> },
          { path: "profile", element: <Profile /> },
        ],
      },
      {
        path: "users",
        element: (
          <ProtectedRoute
            allowedRoles={[ROLES.PRESIDENT, ROLES.GENERAL_MANAGER]}
          >
            <Users />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={[ROLES.LAWYER]}>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "cases",
        element: <Cases />,
      },
      {
        path: "select-court" ,
        element: <SelectCourt />,
      },
      {
        path: "cases/:id",
        element: <CaseDetails />,
      },
      {
        path: "cases/:id/edit",
        element: <AddCaseForm />,
      },
      {
        path: "add-case/:courtId/:courtName",
        element: <AddCaseForm />,
      },
      {
        path: "investigations",
        element: <Investigations />,
      },
      {
        path: "appeals",
        element: <Appeals />,
      },
      {
        path: "contracts",
        element: <Contracts />,
      },
      {
        path: "fatwas",
        element: <Fatwas />,
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute
            allowedRoles={[ROLES.PRESIDENT, ROLES.GENERAL_MANAGER]}
          >
            <Reports />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default route;
