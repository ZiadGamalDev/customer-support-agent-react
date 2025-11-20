import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { useNavigate, useLocation } from "react-router-dom";

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Check for user changes (e.g., after login)
    const checkUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser && (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/")) {
        navigate("/dashboard", { replace: true });
      }
    };

    // Check immediately
    checkUser();

    // Also check periodically in case user logs in from another tab/window
    const interval = setInterval(checkUser, 500);

    return () => clearInterval(interval);
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
