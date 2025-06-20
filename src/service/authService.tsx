import axios, { AxiosResponse, AxiosError } from "axios";

// Types for API requests and responses
export interface SignInRequest {
  username: string;
  email: string;
  role: string;
  password: string;
}

export interface SignInResponse {
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code: string;
}

// Configuration for the API client
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

  /**
   * Creates an axios instance with default configuration
   */
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

  /**
   * Handles API errors and converts them to a standardized format
   */
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

  /**
   * Performs user authentication with the provided credentials
   */
  public async signIn(credentials: SignInRequest): Promise<SignInResponse> {
    try {
      const axiosInstance = this.createAxiosInstance();

      // Validate input before making the request
      this.validateSignInCredentials(credentials);

      const response: AxiosResponse<SignInResponse> = await axiosInstance.post(
        "/sign-in",
        credentials
      );

      // Log successful authentication (remove in production)
      console.log("Authentication successful:", {
        status: response.status,
        user: response.data.user?.username,
      });

      return response.data;
    } catch (error) {
      const apiError = this.handleApiError(error as AxiosError);

      // Log error for debugging (remove sensitive data in production)
      console.error("Authentication error:", {
        message: apiError.message,
        status: apiError.status,
        code: apiError.code,
      });

      throw apiError;
    }
  }

  /**
   * Validates sign-in credentials before making the API request
   */
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

    if (!credentials.role?.trim()) {
      errors.push("Role is required");
    }

    if (errors.length > 0) {
      throw {
        message: errors.join(", "),
        status: 400,
        code: "VALIDATION_ERROR",
      } as ApiError;
    }
  }

  /**
   * Validates email format using a regular expression
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Retrieves the current authentication token from local storage
   */
  public getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  /**
   * Stores the authentication token in local storage
   */
  public setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  /**
   * Removes the authentication token from local storage
   */
  public clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  /**
   * Checks if the user is currently authenticated
   */
  public isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return token !== null && token.length > 0;
  }
}

// Export a singleton instance of the AuthService
export const authService = new AuthService();
