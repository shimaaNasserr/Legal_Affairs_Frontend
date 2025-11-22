import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import { Home } from "../pages/Home/Home";
import Cases from "../pages/Cases/Cases";
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
        index: true,
        element: <Home />,
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
