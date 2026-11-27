import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = sessionStorage.getItem("adminToken");
  const storedUser = sessionStorage.getItem("adminUser");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    return <Navigate to="/admin/login" replace />;
  }

  if (!user || !user.role) {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
