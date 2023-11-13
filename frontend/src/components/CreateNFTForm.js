import React, { useState } from "react";
import { Container, Typography, Button, TextField, Box } from "@mui/material";
import { mintNFTToken } from "../utils/interact.js";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

const EtherscanLink = ({ txHash, tokenId }) => {
  const url = "https://sepolia.etherscan.io/tx/" + txHash;

  return (
    <div>
      <Typography>Token {tokenId} minted! 🪙</Typography>
      <a href={url} target="_blank" rel="noopener noreferrer">
        View on Etherscan:
      </a>
      <Typography>{txHash}</Typography>
    </div>
  );
};

function CreateNFTForm() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!address.trim() || selectedFile === null) {
      toast.error("Please fill in the address and upload a file.");
      setLoading(false);
      return;
    }

    try {
      const res = await mintNFTToken(address, name, description, selectedFile);
      console.log("res: ", res);
      toast.success(<EtherscanLink txHash={res.hash} tokenId={res.tokenId} />, {
        autoClose: false,
      });
    } catch (err) {
      console.log(err);
      toast.error("Error minting NFT. 😭" + err.message);
    }

    setLoading(false);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Create an NFT
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Once your item is minted you will not be able to change any of its
        information. U need to have a deployed ERC721 before mint a token!!!
      </Typography>
      <Typography
        variant="soft"
        color="primary"
        onClick={() => {
          navigate("/deploy");
        }}
      >
        Create and deploy a ERC721 contract here.
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="start"
        marginTop={15}
      >
        {/* Left side: Upload area */}
        <Box
          border={1}
          borderColor="grey.300"
          borderRadius={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          padding={3}
          sx={{ cursor: "pointer", width: "45%", height: "300px" }}
        >
          {selectedFile ? (
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Selected"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          ) : (
            <>
              <Typography variant="body1">Drag and drop media*</Typography>
              <Typography variant="body2" color="textSecondary">
                Browse files
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Max size: 50MB JPG, PNG, GIF, SVG, MP4
              </Typography>
              <input type="file" onChange={handleFileChange} />
            </>
          )}
        </Box>

        {/* Right side: Form fields */}

        <Box display="flex" flexDirection="column" width="45%">
          <TextField
            label="ERC721 Contract Address"
            variant="outlined"
            margin="normal"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <TextField
            label="Name"
            variant="outlined"
            margin="normal"
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Description"
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
            onClick={handleSubmit}
            type="submit"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default CreateNFTForm;
