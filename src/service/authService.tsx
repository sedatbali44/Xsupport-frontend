import axios, { AxiosResponse, AxiosError } from "axios";

export interface SignInRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdTime: string | null;
  updatedTime: string | null;
  lastLogin: string;
}

export interface SignInResponse {
  token?: string;
  type?: string;
  user?: User;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const API_VERSION = "v1";

class AuthService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}/auth`;
    this.timeout = 10000; // 10 seconds timeout
  }

  private createAxiosInstance() {
    return axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  private handleApiError(error: AxiosError): ApiError {
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return {
        message:
          "Unable to connect to the authentication server. Please ensure the backend service is running.",
        status: 503,
        code: "CONNECTION_ERROR",
      };
    }

    if (error.code === "ECONNABORTED") {
      return {
        message: "Request timeout. The server took too long to respond.",
        status: 408,
        code: "TIMEOUT_ERROR",
      };
    }

    if (error.response) {
      const status = error.response.status;
      let message = "An unexpected error occurred during authentication.";
      let code = "API_ERROR";

      switch (status) {
        case 400:
          message =
            "Invalid request data. Please verify all fields are correctly filled.";
          code = "VALIDATION_ERROR";
          break;
        case 401:
          message =
            "Invalid credentials. Please check your username and password.";
          code = "AUTHENTICATION_ERROR";
          break;
        case 403:
          message =
            "Access denied. You do not have permission to perform this action.";
          code = "AUTHORIZATION_ERROR";
          break;
        case 404:
          message =
            "Authentication endpoint not found. Please contact system administrator.";
          code = "ENDPOINT_NOT_FOUND";
          break;
        case 429:
          message =
            "Too many authentication attempts. Please wait before trying again.";
          code = "RATE_LIMIT_ERROR";
          break;
        case 500:
          message =
            "Internal server error. Please try again later or contact support.";
          code = "SERVER_ERROR";
          break;
        default:
          message = `Authentication failed with status ${status}. Please try again.`;
      }

      return {
        message,
        status,
        code,
      };
    }

    return {
      message: "Network error occurred. Please check your internet connection.",
      status: 0,
      code: "NETWORK_ERROR",
    };
  }

  public async signIn(credentials: SignInRequest): Promise<SignInResponse> {
    try {
      const axiosInstance = this.createAxiosInstance();
      this.validateSignInCredentials(credentials);
      const response: AxiosResponse<SignInResponse> = await axiosInstance.post(
        "/sign-in",
        credentials
      );

      // Store user information along with token
      if (response.data.user) {
        this.setUserInfo(response.data.user);
      }

      return response.data;
    } catch (error) {
      const apiError = this.handleApiError(error as AxiosError);
      throw apiError;
    }
  }

  private validateSignInCredentials(credentials: SignInRequest): void {
    const errors: string[] = [];

    if (!credentials.username?.trim()) {
      errors.push("Username is required");
    }

    if (!credentials.email?.trim()) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(credentials.email)) {
      errors.push("Email format is invalid");
    }

    if (!credentials.password?.trim()) {
      errors.push("Password is required");
    }



    if (errors.length > 0) {
      throw {
        message: errors.join(", "),
        status: 400,
        code: "VALIDATION_ERROR",
      } as ApiError;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  public setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  public clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
    }
  }

  public setUserInfo(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("userInfo", JSON.stringify(user));
    }
  }

  public getUserInfo(): User | null {
    if (typeof window !== "undefined") {
      const userInfo = localStorage.getItem("userInfo");
      return userInfo ? JSON.parse(userInfo) : null;
    }
    return null;
  }

  public getUserRole(): string | null {
    const user = this.getUserInfo();
    return user ? user.role : null;
  }

  public isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return token !== null && token.length > 0;
  }
}

export const authService = new AuthService();
