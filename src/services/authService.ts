import axios from "axios";

export interface User {
  id: string;
  role: "agent" | "user" | "customer" | "admin";
  status: "available" | "away" | "busy";
  chatsCount?: number;
  name: string;
  email: string;
  phone?: string | null;
  image?: string;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  token?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface LoginResponse extends AuthResponse {
  user: User;
  token: string;
}

export interface RegisterResponse extends AuthResponse {
  user: User;
  token: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  error?: string;
}

export interface PasswordForgotResponse {
  message: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordConfirmResponse {
  message: string;
}

const USER_KEY = "user";
import { SUPPORT_API_URL } from '@/utils/apiUrl';

const API_URL = SUPPORT_API_URL;

export const authService = {
  login: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/login`,
        {
          email,
          password,
        }
      );

      const { user, token, message } = response.data;

      const userToStore = {
        ...user,
        token,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
      localStorage.setItem("token", token);

      return {
        success: true,
        message: message || "Login successful",
        user: userToStore,
        token,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Login failed",
          error: error.response?.data?.message,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },

  register: async (
    email: string,
    password: string,
    name: string,
    confirmPassword: string
  ): Promise<AuthResult> => {
    try {
      const response = await axios.post<RegisterResponse>(
        `${API_URL}/auth/register`,
        {
          name,
          email,
          password,
          confirmedPassword: confirmPassword,
        }
      );

      const { user, token, message } = response.data;

      const userToStore = {
        ...user,
        token,
      };

      return {
        success: true,
        message: message || "Registration successful",
        user: userToStore,
        token,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Registration failed",
          error: error.response?.data?.message,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  getToken: (): string | null => {
    const user = authService.getCurrentUser();
    return user ? user.token : null;
  },

  getProfile: async (): Promise<AuthResult> => {
    try {
      const token = authService.getToken();

      if (!token) {
        return {
          success: false,
          message: "No token found",
          error: "No token found",
        };
      }
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_URL}/profile/`, { headers });
      const profile = response.data;

      return {
        success: true,
        message: "Profile fetched successfully",
        user: profile,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to fetch profile",
          error: error.response?.data?.message,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },

  updateStatus: async (status: User["status"]): Promise<AuthResult> => {
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      if (!token) {
        return { success: false, message: "No user logged in" };
      }
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.put<AuthResponse>(
        `${API_URL}/profile/agent/${status}`,

        {},
        { headers }
      );

      const updatedUser = { ...currentUser, status };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      return {
        success: true,
        message: "Status updated successfully",
        user: updatedUser,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to update status",
          error: error.response?.data?.message,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },

  updateProfile: async (userData: {
    name?: string;
    avatar?: string;
    phone?: string;
  }): Promise<AuthResult> => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return { success: false, message: "No user logged in" };
      }

      const response = await axios.put<AuthResponse>(
        `${API_URL}/profile`,
        userData,
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );

      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      return {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      };
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to update profile",
          error: error.response?.data?.message,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },
  updatePassword: async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<AuthResult> => {
    try {
      const token = authService.getToken();

      if (!token) {
        return {
          success: false,
          message: "No token found",
          error: "No token found",
        };
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.post(
        `${API_URL}/password/update`,
        {
          oldPassword,
          newPassword,
          confirmPassword,
        },
        { headers }
      );

      return {
        success: true,
        message: response.data.message || "Password updated successfully",
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to update password",
          error: error.response?.data?.message,
        };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },

  forgotPassword: async (email: string): Promise<AuthResult> => {
    try {
      const response = await axios.post<PasswordForgotResponse>(
        `${API_URL}/password/forgot`,
        { email }
      );

      return {
        success: true,
        message:
          response.data.message || "Password reset link sent to your email",
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message:
            error.response?.data?.message || "Failed to send reset email",
          error: error.response?.data?.message,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },

  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<AuthResult> => {
    try {
      const response = await axios.post<PasswordResetResponse>(
        `${API_URL}/password/reset`,
        {
          email,
          otp,
          newPassword,
        }
      );

      return {
        success: true,
        message: response.data.message || "Password reset successfully",
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to reset password",
          error: error.response?.data?.message,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },

  confirmPassword: async (password: string): Promise<AuthResult> => {
    try {
      const token = authService.getToken();

      if (!token) {
        return {
          success: false,
          message: "No token found",
          error: "No token found",
        };
      }

      const response = await axios.post<PasswordConfirmResponse>(
        `${API_URL}/password/confirm`,
        { password },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return {
        success: true,
        message: response.data.message || "Password confirmed successfully",
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message:
            error.response?.data?.message || "Failed to confirm password",
          error: error.response?.data?.message,
        };
      }
      return {
        success: false,
        message: "An unexpected error occurred",
        error: "An unexpected error occurred",
      };
    }
  },

  verifyEmail: async (email: string) => {
    try {
      const token = authService.getToken();

      const response = await fetch(`${API_URL}/email/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Verify Email Error:", error);
      return { success: false, message: "Something went wrong" };
    }
  },
};
