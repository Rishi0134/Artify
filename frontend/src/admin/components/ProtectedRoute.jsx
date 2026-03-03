import { Navigate } from "react-router-dom";
import { getStoredToken, getStoredUser } from "../../utils/auth";

const ProtectedRoute = ({ children, roles = [] }) => {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
