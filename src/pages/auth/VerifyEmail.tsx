import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
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

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|biz|info|io)$/,
      "Please enter a valid email with a proper domain"
    ),
});

interface ForgotPasswordValues {
  email: string;
}

const VerifyEmail = () => {
  const [submitted, setSubmitted] = useState(false);

  const initialValues: ForgotPasswordValues = {
    email: "",
  };

  const handleSubmit = async (
    values: ForgotPasswordValues,
    { setSubmitting }: any
  ) => {
    try {
      const result = await authService.verifyEmail(values.email);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setSubmitted(true);
      toast.success(result.message);
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          {!submitted
            ? "Enter your email to receive a verification link"
            : "Verification link has been sent to your email address."}
        </CardDescription>
      </CardHeader>
      {!submitted ? (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Verification Email"}
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
      ) : (
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            We've sent a verification link to your email. Please check your
            inbox.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSubmitted(false)}
          >
            Try another email
          </Button>
          <div className="flex items-center flex-col space-y-4">
            <Link
              to="/verify-email"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Reset Verification?
            </Link>
            <Link
              to="/login"
              className="mr-2  inline-flex items-center text-sm text-primary hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default VerifyEmail;
