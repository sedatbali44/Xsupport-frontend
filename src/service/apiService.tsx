import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { authService } from "./authService";

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code: string;
}

class ApiService {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * Configures request and response interceptors for the axios instance
   */
  private setupInterceptors(): void {
    // Request interceptor to add authentication token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = authService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request details (remove in production)
        console.log(
          `Making ${config.method?.toUpperCase()} request to ${config.url}`
        );

        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle common response scenarios
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log successful response (remove in production)
        console.log(
          `Response received: ${response.status} from ${response.config.url}`
        );
        return response;
      },
      (error) => {
        // Handle token expiration
        if (error.response?.status === 401) {
          authService.clearAuthToken();
          // Optionally redirect to login page
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }

        console.error(
          "Response interceptor error:",
          error.response?.status,
          error.message
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request method
   */
  public async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(
        endpoint,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request method
   */
  public async post<T, D = any>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(
        endpoint,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request method
   */
  public async put<T, D = any>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(
        endpoint,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request method
   */
  public async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(
        endpoint,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PATCH request method
   */
  public async patch<T, D = any>(
    endpoint: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.patch(
        endpoint,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handles and standardizes API errors
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      return {
        message:
          error.response.data?.message ||
          "An error occurred while processing your request",
        status: error.response.status,
        code: error.response.data?.code || "API_ERROR",
      };
    }

    if (error.request) {
      return {
        message:
          "Network error occurred. Please check your connection and try again.",
        status: 0,
        code: "NETWORK_ERROR",
      };
    }

    return {
      message: error.message || "An unexpected error occurred",
      status: 500,
      code: "UNKNOWN_ERROR",
    };
  }

  /**
   * Updates the base URL for the API service
   */
  public setBaseUrl(baseUrl: string): void {
    this.axiosInstance.defaults.baseURL = baseUrl;
  }

  /**
   * Adds a custom header to all requests
   */
  public setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  /**
   * Removes a custom header from all requests
   */
  public removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }
}

export const apiService = new ApiService();
