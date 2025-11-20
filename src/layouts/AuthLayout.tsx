import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

const AuthLayout = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
