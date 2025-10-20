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
import InvestigationsPage from "../pages/investigations/index";
import AppealsPage from "../pages/appeals/index";
import FatwasPage from "../pages/fatwas/index";
import ReportsPage from "../pages/reports/index";
import Users from "../pages/users/Users";
import Roles from "../pages/users/Roles";
import Profile from "../pages/users/Profile";

const route = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  // Protected root: all routes below require authentication
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
          { path: "investigations", element: <InvestigationsPage /> },
          { path: "appeals", element: <AppealsPage /> },
          { path: "contracts", element: <ContractsList /> },
          { path: "contracts/:id", element: <ContractDetails /> },
          { path: "fatwas", element: <FatwasPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "users", element: <Users /> },
          { path: "roles", element: <Roles /> },
          { path: "profile", element: <Profile /> },
          // Role-restricted routes (president/general_manager/department_manager)
          {
            element: <ProtectedRoute allowedRoles={["president", "general_manager", "department_manager"]} />,
            children: [
              { path: "contracts/new", element: <ContractForm /> },
              { path: "contracts/:id/edit", element: <ContractForm /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default route;

//  <NavLink to="/cases" className="nav-item">
//             <i className="bi bi-briefcase"></i> القضايا
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="/investigations" className="nav-item">
//             <i className="bi bi-search"></i> التحقيقات
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="/appeals" className="nav-item">
//             <i className="bi bi-exclamation-circle"></i> التظلمات
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="/contracts" className="nav-item">
//             <i className="bi bi-file-earmark-text"></i> العقود
//           </NavLink>
//         </li>

//         <li>
//           <NavLink to="/fatwas" className="nav-item"></NavLink>
