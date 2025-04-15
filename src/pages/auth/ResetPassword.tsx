import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Eye, EyeOff } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "@/services/authService";
import { toast } from "sonner";

interface ResetPasswordValues {
  email: string; // Add email field
  otp: string;
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues: ResetPasswordValues = {
    email: "", // Add email initial value
    otp: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: ResetPasswordValues,
    { setSubmitting }: any
  ) => {
    try {
      // First reset the password
      const resetResult = await authService.resetPassword(
        values.email,
        values.otp,
        values.password
      );

      if (!resetResult.success) {
        toast.error(resetResult.message);
        return;
      }

      // Then confirm the password
      // const confirmResult = await authService.confirmPassword(values.password);

      // if (!confirmResult.success) {
      //   toast.error(confirmResult.message);
      //   return;
      // }

      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Update validation schema to include email
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|biz|info|io)$/,
        "Please enter a valid email with a proper domain"
      ),
    otp: Yup.string()
      .required("OTP is required")
      .matches(/^[0-9]{6}$/, "OTP must be exactly 6 digits"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Enter your new password</CardDescription>
      </CardHeader>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <CardContent className="space-y-4">
              {/* Add email field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className={
                    errors.email && touched.email ? "border-red-500" : ""
                  }
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Field
                  as={Input}
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className={errors.otp && touched.otp ? "border-red-500" : ""}
                />
                <ErrorMessage
                  name="otp"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className={`${
                      errors.password && touched.password
                        ? "border-red-500"
                        : ""
                    } pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500"
                        : ""
                    } pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-sm text-red-500 mt-1"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Resetting password..." : "Reset Password"}
              </Button>
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </CardFooter>
          </Form>
        )}
      </Formik>
    </Card>
  );
};

export default ResetPassword;
