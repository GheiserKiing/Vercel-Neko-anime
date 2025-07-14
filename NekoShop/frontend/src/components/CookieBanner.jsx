import React, { useState, useEffect } from "react";
import { Snackbar, Button, Typography, Box } from "@mui/material";
import ReactGA from "react-ga4";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const decision = localStorage.getItem("cookiesDecision");
    if (decision === "accepted") {
      ReactGA.initialize("G-XXXXXXX");
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    } else if (!decision) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesDecision", "accepted");
    ReactGA.initialize("G-XXXXXXX");
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    setOpen(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookiesDecision", "rejected");
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
      sx={{ zIndex: 1400 }} // encima de todo
    >
      <Box
        sx={{
          backgroundColor: "#1f1f1f",
          color: "#f1f1f1",
          p: 2,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          boxShadow: 3,
          minWidth: { xs: "auto", sm: 400 },
        }}
      >
        <Typography variant="body2" sx={{ flex: 1 }}>
          🍪 Usamos cookies para mejorar tu experiencia. ¿Aceptas?
        </Typography>
        <Button
          onClick={handleReject}
          variant="outlined"
          size="small"
          sx={{
            borderColor: "#f1f1f1",
            color: "#f1f1f1",
            textTransform: "none",
            "&:hover": { backgroundColor: "rgba(241,241,241,0.1)" },
          }}
        >
          Rechazar
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: "#ffb400",
            color: "#1f1f1f",
            textTransform: "none",
            "&:hover": { backgroundColor: "#e6a200" },
          }}
        >
          Aceptar
        </Button>
        <Button
          component="a"
          href="/cookies"
          variant="text"
          size="small"
          sx={{
            color: "#bbbbbb",
            textTransform: "none",
            "&:hover": { color: "#ffffff" },
          }}
        >
          Política de Cookies
        </Button>
      </Box>
    </Snackbar>
  );
}
