import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Wallet from "./Wallet";
import CameraIcon from "@mui/icons-material/Camera";
import CssBaseline from "@mui/material/CssBaseline";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import GavelIcon from "@mui/icons-material/Gavel";

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
          <Wallet sx={{ ml: 50 }} />
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            sx={{ ml: 2 }}
            variant="contained"
            onClick={() => {
              navigate("/mint");
            }}
          >
            Create
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default AUAppbar;
