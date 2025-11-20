
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateAndRedirect = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        setIsValidating(false);
        return;
      }

      // Validate token by trying to fetch profile
      try {
        const profile = await authService.getProfile();
        if (profile.success && profile.user) {
          // Valid token, redirect to dashboard only if we're on auth pages
          if (location.pathname === "/login" || location.pathname === "/register" || location.pathname === "") {
            navigate("/dashboard", { replace: true });
          }
        } else {
          // Invalid token, clear it
          authService.logout();
        }
      } catch (error) {
        // Invalid token, clear it
        authService.logout();
      } finally {
        setIsValidating(false);
      }
    };

    // Add a small delay to prevent race conditions with login
    const timer = setTimeout(() => {
      validateAndRedirect();
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate, location.pathname]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
