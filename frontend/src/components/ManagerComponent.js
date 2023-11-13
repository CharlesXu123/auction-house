import React, { useState } from "react";
import { Box, TextField, Button, Typography, Divider } from "@mui/material";
import { toast } from "react-toastify";
import { withdrawFees, changeAdminFee } from "../utils/interact.js";
import CircularProgress from "@mui/material/CircularProgress";

const ManagerComponent = () => {
  const [fee, setFee] = useState(2.5);
  const [loading, setLoading] = useState(false);

  const handleFeeChange = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      await changeAdminFee(fee);
      toast.success("Fee changed successfully!");
    } catch (error) {
      toast.error("Error changing fee");
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
      >
        Set Fee
      </Button>

      <Button
        variant="outlined"
        fullWidth
        onClick={handleWithdrawFees}
        sx={{ mt: 2 }}
      >
        Withdraw Fees
      </Button>
      {loading ? <CircularProgress sx={{ mt: 2 }} /> : <></>}
    </Box>
  );
};

export default ManagerComponent;
