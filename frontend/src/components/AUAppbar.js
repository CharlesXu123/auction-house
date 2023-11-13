import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import Wallet from "./Wallet";
import CssBaseline from "@mui/material/CssBaseline";
import { useNavigate } from "react-router-dom";
import GavelIcon from "@mui/icons-material/Gavel";
import AccessControlButton from "./AccessControlButton";

function AUAppbar() {
  const navigate = useNavigate();

  return (
    <>
      <CssBaseline />
      <AppBar position="static" sx={{ mb: 5 }}>
        <Toolbar>
          <GavelIcon
            sx={{ mr: 2 }}
            onClick={() => {
              navigate("/");
            }}
          />
          <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
            Auction House
          </Typography>
          <AccessControlButton />
          <Wallet sx={{ ml: 50 }} />
        </Toolbar>
      </AppBar>
    </>
  );
}

export default AUAppbar;
