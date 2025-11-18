import apiClient from "./api-client";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "masjid_admin" | "content_manager" | "viewer";
  masjidId?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  masjidId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    const { token, user } = response.data;

    // Store token and user in localStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    const { token, user } = response.data;

    // Store token and user in localStorage
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  hasRole(role: User["role"]): boolean {
    const user = this.getUser();
    return user?.role === role;
  },

  isSuperAdmin(): boolean {
    return this.hasRole("super_admin");
  },
};
