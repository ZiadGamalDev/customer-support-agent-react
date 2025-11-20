import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";

const RequireAuth = () => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  if (!user) {
    // Redirect to login page but save the location they were
    // trying to access so we can send them there after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
