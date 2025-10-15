import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import { Home } from "../pages/Home/Home";
import { Cases } from "../pages/Cases/Cases";

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
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "cases",
        element: <Cases />,
      },
      {
        path: "investigations",
        element: <div>investigations Page</div>,
      },
      {
        path: "appeals",
        element: <div>appeals Page</div>,
      },
      {
        path: "contracts",
        element: <div>contracts Page</div>,
      },
      {
        path: "fatwas",
        element: <div>fatwas Page</div>,
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
