import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import { mintNFTToken } from "../utils/interact.js";
import uploadImage from "../images/uploadImage.jpg";

export default function MintNFT() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(uploadImage);

  const handleSubmit = async (event) => {
    const res = await mintNFTToken(address, name, description, selectedFile);
    console.log("res: ", res);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: "center",
        alignItems: "center",
        top: "20%",
        position: "absolute",
      }}
    >
      <Box
        sx={{
          width: "50%",
          height: "50%",
          justifyContent: "center",
          ml: 5,
          border: "1px dashed grey",
        }}
      >
        <img
          src={preview}
          alt="Preview"
          style={{ width: "100%", height: "auto" }}
        />
      </Box>
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography variant="h4">Mint NFT</Typography>
        <TextField
          label="Address"
          variant="outlined"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" onChange={handleFileChange} />
        <Button variant="contained" component="label" onClick={handleSubmit}>
          Mint
        </Button>
      </Box>
    </Box>
  );
}
