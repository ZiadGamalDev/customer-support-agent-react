import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";
import { useEffect, useState } from "react";

const RequireAuth = () => {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Validate token by trying to fetch profile
      try {
        const profile = await authService.getProfile();
        if (profile.success && profile.user) {
          setIsAuthenticated(true);
        } else {
          // Invalid token, clear it
          authService.logout();
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Invalid token, clear it
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateAuth();
  }, []);

  if (isValidating) {
    // Show loading state while validating
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the location they were
    // trying to access so we can send them there after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
