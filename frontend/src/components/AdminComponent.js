import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CircularProgress from "@mui/material/CircularProgress";

import { toast } from "react-toastify";
import {
  withdrawFees,
  addManager,
  removeManager,
  changeAdminAddress,
  changeAdminFee,
} from "../utils/interact.js";

const AdminComponent = () => {
  const [fee, setFee] = useState(2.5);
  const [adminAddress, setAdminAddress] = useState("");
  const [managerAddress, setManagerAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFeeChange = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      await changeAdminFee(fee);
      toast.success("Fee changed successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Error changing fee");
    }

    setLoading(false);
  };

  const handleChangeAdmin = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      await changeAdminAddress(adminAddress);
      toast.success("Admin address changed successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Error changing admin address");
    }

    setLoading(false);
  };

  const handleWithdrawFees = async (event) => {
    event.preventDefault();

    setLoading(true);
    try {
      await withdrawFees();
      toast.success("Fees withdrawn successfully!");
    } catch (error) {
      toast.error("Error withdrawing fees");
    }

    setLoading(false);
  };

  const handleAddManager = async (event) => {
    event.preventDefault();

    setLoading(true);
    try {
      await addManager(managerAddress);
      toast.success("Manager added successfully!");
    } catch (error) {
      toast.error("Error adding manager");
    }

    setLoading(false);
  };

  const handleRemoveManager = async (event) => {
    event.preventDefault();

    setLoading(true);
    try {
      await removeManager(managerAddress);
      toast.success("Manager removed successfully!");
    } catch (error) {
      toast.error("Error removing manager");
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        m: "auto",
        p: 2,
        display: "flex",
        justifyContent: "space-evenly",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Admin Settings
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <TextField
        fullWidth
        label="Set Auction Fee (%)"
        type="number"
        InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
        variant="outlined"
        value={fee}
        onChange={(e) => {
          setFee(e.target.value);
        }}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleFeeChange}
        disabled={loading}
      >
        Set Fee
      </Button>

      <TextField
        fullWidth
        label="Change Admin Address"
        variant="outlined"
        value={adminAddress}
        onChange={(e) => {
          setAdminAddress(e.target.value);
        }}
        sx={{ my: 2 }}
      />

      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        fullWidth
        onClick={handleChangeAdmin}
        disabled={loading}
      >
        Change Admin
      </Button>

      <Button
        variant="outlined"
        fullWidth
        onClick={handleWithdrawFees}
        sx={{ mb: 2 }}
        disabled={loading}
      >
        Withdraw Fees
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        <TextField
          fullWidth
          label="Add Manager Address"
          variant="outlined"
          sx={{ mr: 2 }}
          onChange={(e) => {
            setManagerAddress(e.target.value);
          }}
        />
        <IconButton
          color="primary"
          onClick={handleAddManager}
          disabled={loading}
        >
          <AddCircleOutlineIcon />
        </IconButton>

        <IconButton
          color="primary"
          onClick={handleRemoveManager}
          disabled={loading}
        >
          <RemoveCircleOutlineIcon color="secondary" />
        </IconButton>
      </Box>

      {loading ? <CircularProgress sx={{ mt: 2 }} /> : <></>}
    </Box>
  );
};

export default AdminComponent;
