import { apiService } from "./apiService";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdBy: string;
  assignedTo?: string;
  createdTime: string;
  updatedTime: string;
}

export interface TicketResponse {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code: string;
}

class TicketService {
  private readonly baseEndpoint = "/api/v1/ticket";

  /**
   * Fetches tickets based on user role
   * Admin users get all tickets with pagination
   * Non-admin users get their own tickets
   */
  public async getTicketsByRole(
    userRole: string,
    page: number = 0,
    size: number = 10
  ): Promise<TicketResponse | Ticket[]> {
    try {
      if (userRole === "ADMIN") {
        return await this.getAllTickets(page, size);
      } else {
        return await this.getOwnTickets();
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetches all tickets for admin users with pagination
   */
  private async getAllTickets(
    page: number = 0,
    size: number = 10
  ): Promise<TicketResponse> {
    try {
      const response = await apiService.get<TicketResponse>(
        `${this.baseEndpoint}/all?page=${page}&size=${size}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetches tickets for the current logged-in user
   */
  private async getOwnTickets(): Promise<Ticket[]> {
    try {
      const response = await apiService.get<Ticket[]>(
        `${this.baseEndpoint}/own-tickets`
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handles API errors and provides user-friendly error messages
   */
  private handleError(error: any): ApiError {
    if (error.message && error.status && error.code) {
      return error as ApiError;
    }

    return {
      message: error.message || "An error occurred while fetching tickets",
      status: error.status || 500,
      code: error.code || "TICKET_FETCH_ERROR",
    };
  }
}

export const ticketService = new TicketService();
