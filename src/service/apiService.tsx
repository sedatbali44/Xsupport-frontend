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

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = authService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          authService.clearAuthToken();
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }
        return Promise.reject(error);
      }
    );
  }

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

  public setBaseUrl(baseUrl: string): void {
    this.axiosInstance.defaults.baseURL = baseUrl;
  }

  public setHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  public removeHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }
}

export const apiService = new ApiService();
