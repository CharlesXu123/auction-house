import React, { useState, useEffect } from "react";
import { connectWallet, getCurrentWalletConnected } from "../utils/interact.js";
import Button from "@mui/material/Button";

const Wallet = (props) => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("not loaded");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setURL] = useState("");

  useEffect(() => {
    const getWallet = async () => {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address);
      setStatus(status);
    };

    getWallet();
    addWalletListener();
    // Code here will run after *every* render
  });

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  return (
    <Button variant="contained" onClick={connectWalletPressed}>
      {walletAddress.length > 0 ? (
        "Connected: " +
        String(walletAddress).substring(0, 6) +
        "..." +
        String(walletAddress).substring(38)
      ) : (
        <span>Connect Wallet</span>
      )}
    </Button>
  );
};

export default Wallet;
