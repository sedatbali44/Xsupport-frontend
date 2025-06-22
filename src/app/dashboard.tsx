// src/app/dashboard/page.tsx

"use client";

import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authService } from "../service/authService";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        router.push("/");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSignOut = () => {
    authService.clearAuthToken();
    router.push("/");
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
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
      <Box
        sx={{
          width: 500,
          height: 427,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Box>
          <Image src="/xmind.png" alt="logo" width={256} height={54} />
        </Box>
        <Typography variant="h3" sx={{ mt: "50px", fontSize: "36px" }}>
          Welcome to Dashboard
        </Typography>
        <Typography variant="h5" sx={{ mt: "16px", fontWeight: "500" }}>
          test
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
