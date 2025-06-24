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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authService, User } from "../../service/authService";
import {
  ticketService,
  Ticket,
  TicketResponse,
  CreateTicket,
  UpdateTicket,
  SelectOption,
} from "../../service/ticketService";
import { useEffect, useState } from "react";

interface TicketFormData {
  title: string;
  description: string;
  category: string;
  status: string;
  adminResponse: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [formData, setFormData] = useState<TicketFormData>({
    title: "",
    description: "",
    category: "GENERAL",
    status: "OPEN",
    adminResponse: "",
  });

  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [statuses, setStatuses] = useState<SelectOption[]>([]);
  const isAdmin = user?.role === "ADMIN";
  useEffect(() => {
    setCategories(ticketService.getCategories());
    setStatuses(ticketService.getStatuses());
  }, []);

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
        currentPage - 1,
        10
      );

      if (isAdmin) {
        const adminResponse = response as TicketResponse;
        setTickets(adminResponse.content);
        setTotalPages(adminResponse.totalPages);
      } else {
        const userTickets = response as Ticket[];
        setTickets(userTickets);
        setTotalPages(1);
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

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "primary";
      case "ANSWERED":
        return "warning";
      case "CLOSED":
        return "default";
      default:
        return "default";
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "GENERAL",
      status: "OPEN",
      adminResponse: "",
    });
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleEditOpen = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      category: "GENERAL",
      status: ticket.status,
      adminResponse: ticket.adminResponse,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteOpen = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async () => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const createRequest: CreateTicket = {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        status: formData.status,
      };

      await ticketService.createTicket(createRequest);
      setSuccess("Ticket created successfully");
      setCreateDialogOpen(false);
      resetForm();
      fetchTickets();
    } catch (error: any) {
      setError(error.message || "Failed to create ticket");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedTicket) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateRequest: UpdateTicket = {
        id: selectedTicket.id.toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        status: formData.status as any,
        adminResponse: formData.adminResponse,
      };

      await ticketService.updateTicket(updateRequest);
      setSuccess("Ticket updated successfully");
      setEditDialogOpen(false);
      resetForm();
      setSelectedTicket(null);
      fetchTickets();
    } catch (error: any) {
      setError(error.message || "Failed to update ticket");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTicket) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      await ticketService.deleteTicket(selectedTicket.id.toString());
      setSuccess("Ticket deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedTicket(null);
      fetchTickets();
    } catch (error: any) {
      setError(error.message || "Failed to delete ticket");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange =
    (field: keyof TicketFormData) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSignOut = async () => {
    setError("");
    try {
      await authService.signOut();
      setSuccess("Successfully signed out");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      setError(
        "Sign out completed, but there was a server communication issue"
      );
      setTimeout(() => {
        router.push("/");
      }, 2000);
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
        position: "relative",
      }}
    >
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

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">
            {isAdmin ? "All Tickets" : "My Tickets"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOpen}
            sx={{ mb: 2 }}
          >
            Create Ticket
          </Button>
        </Box>

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
                {isAdmin
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
                    {isAdmin && <TableCell>Created By</TableCell>}
                    {!isAdmin && <TableCell>Admin Response</TableCell>}
                    <TableCell>Created Date</TableCell>
                    {isAdmin && <TableCell>Actions</TableCell>}
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
                          label={ticketService.getStatusLabel(ticket.status)}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                      </TableCell>
                      {!isAdmin && (
                        <TableCell>
                          {ticket.adminResponse || "No admin response yet"}
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>{ticket.userName || "Unassigned"}</TableCell>
                      )}
                      <TableCell>
                        {new Date(ticket.createdTime).toLocaleDateString()}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEditOpen(ticket)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteOpen(ticket)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {isAdmin && totalPages > 1 && (
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

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={handleFormChange("title")}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleFormChange("description")}
              fullWidth
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleFormChange("category")}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={actionLoading || !formData.title || !formData.description}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={handleFormChange("title")}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleFormChange("description")}
              fullWidth
              multiline
              rows={4}
              required
            />
            <TextField
              label="Admin Response"
              value={formData.adminResponse}
              onChange={handleFormChange("adminResponse")}
              fullWidth
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleFormChange("category")}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleFormChange("status")}
                label="Status"
              >
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={actionLoading || !formData.title || !formData.description}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Ticket</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this ticket? This action cannot be
            undone.
          </Typography>
          {selectedTicket && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {selectedTicket.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {selectedTicket.id}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteSubmit}
            variant="contained"
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
