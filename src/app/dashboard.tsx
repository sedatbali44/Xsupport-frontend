// app/dashboard/page.tsx

"use client";

import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const Dashboard = () => {
  return (
    <Box
      sx={{
        width: 1,
        height: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
          Welcome
        </Typography>
        <Typography variant="h5" sx={{ mt: "16px", fontWeight: "500" }}>
          Easily Accept Payments For Your Business
        </Typography>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          sx={{
            mt: "40px",
            width: "500px",
            height: "56px",
            borderRadius: "6px",
            border: "1px solid #2E3192",
          }}
        >
          test
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
