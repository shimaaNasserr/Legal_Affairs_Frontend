import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // أو Loading Spinner

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles?.length > 0) {
    const role = user.role?.name || user.role;
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
