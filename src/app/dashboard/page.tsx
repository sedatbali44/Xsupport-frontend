"use client";

import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Card,
  CardContent,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authService, User } from "../../service/authService";
import {
  ticketService,
  Ticket,
  TicketResponse,
} from "../../service/ticketService";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const userInfo = authService.getUserInfo();

      setIsAuthenticated(authenticated);
      setUser(userInfo);

      if (!authenticated) {
        router.push("/");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (user && isAuthenticated) {
      fetchTickets();
    }
  }, [user, isAuthenticated, currentPage]);

  const fetchTickets = async () => {
    if (!user) return;

    setTicketsLoading(true);
    setError("");

    try {
      const response = await ticketService.getTicketsByRole(
        user.role,
        currentPage - 1, // Backend uses 0-based pagination
        10
      );

      if (user.role === "ADMIN") {
        const adminResponse = response as TicketResponse;
        setTickets(adminResponse.content);
        setTotalPages(adminResponse.totalPages);
      } else {
        const userTickets = response as Ticket[];
        setTickets(userTickets);
        setTotalPages(1); // Non-admin users don't have pagination
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch tickets");
    } finally {
      setTicketsLoading(false);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  const handleSignOut = () => {
    authService.clearAuthToken();
    router.push("/");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "primary";
      case "in_progress":
        return "warning";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: 1,
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Box
      sx={{
        width: 1,
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
        p: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 2,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Image src="/xmind.png" alt="logo" width={128} height={27} />
          <Typography variant="h4" sx={{ ml: 2, fontWeight: 600 }}>
            Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={`${user.role} - ${user.username}`}
            variant="outlined"
            sx={{ color: "var(--foreground)" }}
          />
          <Button variant="contained" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>
          {user.role === "ADMIN" ? "All Tickets" : "My Tickets"}
        </Typography>

        {ticketsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : tickets.length === 0 ? (
          <Card sx={{ background: "rgba(255,255,255,0.05)" }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No tickets found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {user.role === "ADMIN"
                  ? "There are no tickets in the system yet."
                  : "You have no assigned tickets at the moment."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{ background: "rgba(255,255,255,0.05)" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Created By</TableCell>
                    {user.role === "ADMIN" && (
                      <TableCell>Assigned To</TableCell>
                    )}
                    <TableCell>Created Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 500 }}
                        >
                          {ticket.title}
                        </Typography>
                        {ticket.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ticket.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{ticket.createdBy}</TableCell>
                      {user.role === "ADMIN" && (
                        <TableCell>
                          {ticket.assignedTo || "Unassigned"}
                        </TableCell>
                      )}
                      <TableCell>
                        {new Date(ticket.createdTime).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {user.role === "ADMIN" && totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
