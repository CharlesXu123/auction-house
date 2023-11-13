import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  InputAdornment,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { getAdminFee, createAuction, getAuction } from "../utils/interact";
import { toast } from "react-toastify";

const EtherscanLink = ({ auctionAddress }) => {
  const url = "https://sepolia.etherscan.io/address/" + auctionAddress;

  return (
    <div>
      <Typography>Auction {auctionAddress} created! </Typography>
      <a href={url} target="_blank" rel="noopener noreferrer">
        View on Etherscan
      </a>
    </div>
  );
};

function CreateAuctionForm() {
  const [nftAddress, setNftAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [duration, setDuration] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const [adminFee, setAdminFee] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getFee = async () => {
      try {
        const fee = await getAdminFee();
        setAdminFee(fee);
      } catch (error) {
        toast.error("Error getting admin fee");
      }
      const aucData = await getAuction(
        "0xD8F4Ee980Bc4aAC05038a8717FD82320C6EACE11"
      );
      console.log(aucData);
    };
    getFee();
  }, []);

  const handleDurationChange = (field, value) => {
    setDuration((prevDuration) => ({
      ...prevDuration,
      [field]: parseInt(value, 10),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    // check all fields are filled
    if (!nftAddress || !tokenId || !startingPrice) {
      toast.error("Please fill all fields");
      setLoading(false);
      return;
    }
    // check duration is not 0
    if (duration.days === 0 && duration.hours === 0 && duration.minutes === 0) {
      toast.error("Duration cannot be 0");
      setLoading(false);
      return;
    }

    console.log("Creating auction with:", {
      nftAddress,
      tokenId,
      startingPrice,
      duration,
      adminFee,
    });

    try {
      const auctionAddress = await createAuction(
        nftAddress,
        tokenId,
        startingPrice,
        duration
      );
      toast.success(<EtherscanLink auctionAddress={auctionAddress} />, {
        autoClose: false,
      });
    } catch (error) {
      console.log(error);
      toast.error("Error creating auction");
    }
    setLoading(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          "& .MuiTextField-root": { m: 1, width: "100%" }, // Sets the width of all TextFields to be the same
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Create Auction
        </Typography>

        <TextField
          label="NFT Address"
          variant="outlined"
          required
          value={nftAddress}
          onChange={(e) => setNftAddress(e.target.value)}
        />
        <TextField
          label="Token ID"
          variant="outlined"
          required
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <TextField
          label="Starting Price"
          variant="outlined"
          required
          InputProps={{
            endAdornment: <InputAdornment position="start">AUC</InputAdornment>,
          }}
          value={startingPrice}
          onChange={(e) => setStartingPrice(e.target.value)}
        />

        <Typography variant="subtitle1" sx={{ alignSelf: "flex-start", ml: 1 }}>
          Duration
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <TextField
            label="Days"
            type="number"
            variant="outlined"
            InputProps={{ inputProps: { min: 0 } }}
            value={duration.days}
            onChange={(e) => handleDurationChange("days", e.target.value)}
          />
          <TextField
            label="Hours"
            type="number"
            variant="outlined"
            InputProps={{ inputProps: { min: 0 } }}
            value={duration.hours}
            onChange={(e) => handleDurationChange("hours", e.target.value)}
          />
          <TextField
            label="Minutes"
            type="number"
            variant="outlined"
            InputProps={{ inputProps: { min: 0 } }}
            value={duration.minutes}
            onChange={(e) => handleDurationChange("minutes", e.target.value)}
          />
        </Box>

        <Typography variant="h6" sx={{ mt: 2 }}>
          Admin Fee: {adminFee}%
        </Typography>

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create Auction"}
        </Button>
      </Box>
    </Container>
  );
}

export default CreateAuctionForm;
