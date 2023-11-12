import React, { useState } from "react";
import { Container, Box, Button, TextField, Typography } from "@mui/material";
import { createNFTContract } from "../utils/interact.js";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

function DeployContractForm() {
  const navigate = useNavigate();

  // State for each input field
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    setLoading(true);

    // Validate fields
    if (!tokenName.trim() || !tokenSymbol.trim()) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const address = await createNFTContract(tokenName, tokenSymbol);
      toast.success(`Contract deployed at ${address}`);
      setAddress(address);
    } catch (err) {
      console.log(err);
      toast.error("Error deploying contract. 😭" + err.message);
    }
    setLoading(false);
    console.log("Form submitted with:", { tokenName, tokenSymbol });
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
        display="flex"
        flexDirection="column"
        component="form"
        onSubmit={handleSubmit}
        noValidate
        alignItems="center"
      >
        <Typography variant="h3" gutterBottom>
          Deploy Contract
        </Typography>

        <TextField
          label="Token Name"
          variant="outlined"
          margin="normal"
          required
          fullWidth
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
        />
        <TextField
          label="Token Symbol"
          variant="outlined"
          margin="normal"
          required
          fullWidth
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Deploy"}
        </Button>
      </Box>
      {address.trim() ? (
        <Box>
          <Typography sx={{ mt: 2 }}>
            {" "}
            contract deployed to {address}
          </Typography>
          <Typography
            onClick={() => {
              navigate("/mint");
            }}
            color="primary"
          >
            mint your first token by copying this address! 🥳
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography>Already have a deployed ERC721?</Typography>
          <Typography
            onClick={() => {
              navigate("/mint");
            }}
            color="primary"
          >
            Mint a token! 🪙{" "}
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default DeployContractForm;
