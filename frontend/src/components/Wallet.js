import React, { useState, useEffect } from "react";
import { connectWallet, getCurrentWalletConnected } from "../utils/interact.js";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";

import { getAUCBalance, mintAUC } from "../utils/interact.js";
import { Typography, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";

const Wallet = (props) => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("not loaded");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getWallet = async () => {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
      if (status === "connected") {
        const aucBalance = await getAUCBalance();
        setBalance(aucBalance);
      }
      if (status === "no metamask detected") {
        toast.error("No Metamask detected. Please install Metamask.");
      }
    };

    getWallet();
    subscribeToAccountChanges();
  });

  const handleMintAUC = async () => {
    try {
      setLoading(true);
      await mintAUC();
      toast.success("100 AUC minted! 🪙");
      const aucBalance = await getAUCBalance();
      setBalance(aucBalance);
    } catch (err) {
      toast.error("Error minting AUC. 😭");
    }
    setLoading(false);
  };

  function subscribeToAccountChanges() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("connected");
        } else {
          setWallet("");
          setStatus("Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus("no metamask detected");
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  return (
    <Box>
      <Button variant="contained" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          <Typography>
            {walletAddress.substring(0, 6)}...{walletAddress.substring(38, 42)}{" "}
            | {balance} AUC
          </Typography>
        ) : (
          <span>Connect Wallet</span>
        )}
      </Button>
      <Button
        color="inherit"
        startIcon={<AddIcon />}
        sx={{ ml: 2 }}
        variant="contained"
        onClick={() => {
          handleMintAUC();
        }}
        disabled={loading || status !== "connected"}
      >
        {loading ? <CircularProgress size={24} /> : "Mint 100 AUC"}
      </Button>
    </Box>
  );
};

export default Wallet;
