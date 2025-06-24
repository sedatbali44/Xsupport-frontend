import { apiService } from "./apiService";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  createdBy: string;
  createdTime: string;
  updatedTime: string;
  userName: string;
}

export interface CreateTicket {
  title: string;
  description: string;
  category: Category;
  status: string;
}

export interface UpdateTicket {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
}

export interface Status {
  OPEN: string;
  ANSWERED: string;
  CLOSED: string;
}

export interface Category {
  TECHNICAL: string;
  BILLING: string;
  GENERAL: string;
  COMPLAINT: string;
  FEATURE_REQUEST: string;
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

  private async createTicket(request: CreateTicket): Promise<Ticket[]> {
    try {
      const response = await apiService.post<Ticket[]>(
        `${this.baseEndpoint}/create`,
        request
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async updateTicket(request: UpdateTicket): Promise<Ticket[]> {
    try {
      const response = await apiService.put<Ticket[]>(
        `${this.baseEndpoint}/update`,
        request
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async deleteTicket(id: string): Promise<string> {
    try {
      const response = await apiService.delete<string>(
        `${this.baseEndpoint}/delete`,
        { params: { id } }
      );
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

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
