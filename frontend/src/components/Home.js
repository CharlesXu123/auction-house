import React, { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";

export default function Home() {
  const navigate = useNavigate();

  const [auctionAddress, setAuctionAddress] = useState("");

  return (
    <div>
      <main>
        <Box
          sx={{
            bgcolor: "background.paper",
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Auction House 🏛
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              paragraph
            >
              Connect your wallet and step into a vibrant marketplace of digital
              art and collectibles. Our auction app makes buying and selling
              NFTs simple, secure, and fun. Start your immersive journey into
              the world of NFTs today!
            </Typography>
            <Stack
              sx={{ pt: 4 }}
              direction="row"
              spacing={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/create Auction");
                }}
              >
                Create Auction
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  navigate("/mint");
                }}
              >
                Create NFT
              </Button>
            </Stack>
            <Box
              my={4}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <TextField
                label="Auction Address"
                variant="outlined"
                value={auctionAddress}
                onChange={(e) => {
                  setAuctionAddress(e.target.value);
                }}
                required
                fullWidth
              ></TextField>
              <Button
                size="large"
                onClick={() => {
                  navigate(`/auction/${auctionAddress}`);
                }}
              >
                Go
              </Button>
            </Box>
          </Container>
        </Box>
      </main>
    </div>
  );
}
