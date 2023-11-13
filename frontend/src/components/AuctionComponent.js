import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  TextField,
  Box,
  Grid,
  InputAdornment,
  Typography,
  Divider,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

import {
  getAuction,
  placeBid,
  getOnlyBidInfo,
  endAuction,
  cancellAuction,
  claimNFT,
} from "../utils/interact.js";

export default function AuctionComponent() {
  const { auctionAddress } = useParams();

  const [nftName, setNftName] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [auctioneer, setAuctioneer] = useState("");
  const [windowEthereum, setWindowEthereum] = useState(null);
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("Default Name");
  const [endTimeDate, setEndTimeDate] = useState("");
  const [highestBid, setHighestBid] = useState("");
  const [highestBidder, setHighestBidder] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [ended, setEnded] = useState(false);
  const [placeBidLoading, setplaceBidLoading] = useState(false);
  const [cancelAuctionLoading, setCancelAuctionLoading] = useState(false);
  const [endAuctionLoading, setEndAuctionLoading] = useState(false);
  const [claimNFTLoading, setClaimNFTLoading] = useState(false);

  useEffect(() => {
    async function getAuctionData() {
      try {
        const aucData = await getAuction(auctionAddress);
        console.log(aucData);
        setNftName(aucData.nftName);
        setStartingPrice(aucData.startingPrice);
        setAuctioneer(aucData.auctioneer);
        if (aucData.metaData) {
          setImage(aucData.metaData.image);
          setDescription(aucData.metaData.description);
          setName(aucData.metaData.name);
        }
        setEndTimeDate(aucData.endTimeDate);
        setHighestBid(aucData.highestBid);
        setHighestBidder(aucData.highestBidder);
        setEnded(aucData.ended);
      } catch (error) {
        console.log(error);
        toast.error("Error getting auction data");
      }
    }

    async function getOnlyBidInfoData() {
      try {
        const bidInfo = await getOnlyBidInfo(auctionAddress);
        console.log(bidInfo);
        setHighestBid(bidInfo.highestBid);
        setHighestBidder(bidInfo.highestBidder);
        setEnded(bidInfo.ended);
      } catch (error) {
        console.log(error);
        toast.error("Error getting auction data");
      }
    }

    if (window.ethereum.selectedAddress) {
      setWindowEthereum(window.ethereum.selectedAddress.toLowerCase().trim());
    }

    getAuctionData();

    const intervalId = setInterval(getOnlyBidInfoData, 30000); // Call the function every 30 seconds

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  const handlePlaceBid = async (event) => {
    event.preventDefault();

    // check if bidAmount is valid positive number
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error("Invalid bid amount");
      return;
    }

    setplaceBidLoading(true);

    try {
      const basePrice = highestBid === "0.0" ? startingPrice : highestBid;
      await placeBid(
        auctionAddress,
        (Number(basePrice) + Number(bidAmount)).toString()
      );
      toast.success("Bid placed!");
    } catch (error) {
      console.log(error);
      toast.error("Error placing bid");
    }

    setplaceBidLoading(false);
  };

  const handleEndAuction = async (event) => {
    event.preventDefault();

    setEndAuctionLoading(true);

    try {
      await endAuction(auctionAddress);
      toast.success("Auction ended!");
    } catch (error) {
      console.log(error);
      toast.error("Error ending auction");
    }

    setEndAuctionLoading(false);
  };

  const handleCancelAuction = async (event) => {
    event.preventDefault();

    setCancelAuctionLoading(true);

    try {
      await cancellAuction(auctionAddress);
      toast.success("Auction cancelled!");
    } catch (error) {
      console.log(error);
      toast.error("Error cancelling auction");
    }

    setCancelAuctionLoading(false);
  };

  const handleClaimNFT = async (event) => {
    event.preventDefault();

    if (Date.now() < endTimeDate.getTime()) {
      toast.error("Auction not ended yet");
      return;
    }

    setClaimNFTLoading(true);

    try {
      await claimNFT(auctionAddress);
      toast.success("NFT claimed!");
    } catch (error) {
      console.log(error);
      toast.error("Error claiming NFT");
    }

    setClaimNFTLoading(false);
  };

  return (
    <Grid container sx={{ height: "100vh" }} spacing={2}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        width="90%"
        sx={{
          backgroundImage: `url(${image})`,
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />
      <Grid item xs={12} sm={8} md={5} elevation={6} square>
        <Box
          sx={{
            my: 1,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography variant="h6" gutterBottom>
            {nftName}
          </Typography>
          <Typography variant="h3" gutterBottom>
            {name}
          </Typography>
          <Typography variant="h8" gutterBottom>
            Owned by {auctioneer}
          </Typography>

          <Box
            sx={{
              bgcolor: "grey.900", // assuming a dark theme similar to the image
              color: "white",
              borderRadius: "4px", // adjust as needed
              overflow: "hidden", // keeps child elements within the rounded corners
              width: "100%",
              my: 5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                bgcolor: "grey.800",
              }}
            >
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                ☰ Description
              </Typography>
            </Box>
            <Divider sx={{ bgcolor: "grey.700" }} />
            <Box sx={{ p: 2 }}>
              <Typography variant="body2">{description}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: "grey.900",
              color: "white",
              borderRadius: "4px",
              overflow: "hidden",
              width: "100%",
              my: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                bgcolor: "grey.800",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon sx={{ color: "grey.500" }} />
                <Typography variant="body1">
                  {ended
                    ? "Auction ended"
                    : `Sale ends at ${endTimeDate.toLocaleString()}`}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ bgcolor: "grey.700" }} /> {/* Divider color */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 3,
                }}
              >
                {highestBid === "0.0" ? (
                  <Typography variant="h6">
                    Starting Price: {startingPrice} AUC{" "}
                  </Typography>
                ) : (
                  <Typography variant="h6" gutterBottom>
                    Highest Bid: {highestBid} AUC
                    <Typography variant="body1" gutterBottom>
                      by {highestBidder.slice(0, 6)}...{highestBidder.slice(-4)}
                    </Typography>
                  </Typography>
                )}
                <Typography variant="h6" gutterBottom>
                  +
                </Typography>
                <TextField
                  margin="normal"
                  width="25%"
                  label="Bid Amount"
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">AUC</InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="Large"
                width="25%"
                sx={{ mt: 3, mb: 2 }}
                onClick={handlePlaceBid}
                disabled={placeBidLoading || ended}
              >
                {placeBidLoading ? <CircularProgress size={24} /> : "Place Bid"}
              </Button>
            </Box>
          </Box>

          {auctioneer.trim().toLowerCase() === windowEthereum ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
                width: "100%",
              }}
              my={5}
            >
              <Button
                type="submit"
                variant="contained"
                size="Large"
                width="25%"
                sx={{ mt: 3, mb: 2 }}
                color="secondary"
                onClick={handleCancelAuction}
                disabled={cancelAuctionLoading || ended}
              >
                {cancelAuctionLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Cancel Auction"
                )}
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="Large"
                width="25%"
                sx={{ mt: 3, mb: 2 }}
                color="success"
                onClick={handleEndAuction}
                disabled={endAuctionLoading || ended}
              >
                {endAuctionLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  "End Auction"
                )}
              </Button>
            </Box>
          ) : (
            <Button
              type="submit"
              variant="contained"
              size="Large"
              width="25%"
              sx={{ mt: 3, mb: 2 }}
              color="success"
              onClick={handleClaimNFT}
              disabled={claimNFTLoading || ended}
            >
              {claimNFTLoading ? <CircularProgress size={24} /> : "Claim NFT"}
            </Button>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
