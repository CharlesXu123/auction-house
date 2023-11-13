import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AUAppbar from "./AUAppbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./Home";
import MintNFT from "./MintNFT";
import CreateNFTForm from "./CreateNFTForm";
import DeployContractForm from "./DeployContractForm";
import CreateAuctionForm from "./CreateAuctionForm";
import AuctionComponent from "./AuctionComponent";
import AdminComponent from "./AdminComponent";
import ManagerComponent from "./ManagerComponent";
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Dapp = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <Router>
        <AUAppbar />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create Contract" element={<MintNFT />} />
          <Route path="/mint" element={<CreateNFTForm />} />
          <Route path="/deploy" element={<DeployContractForm />} />
          <Route path="/create auction" element={<CreateAuctionForm />} />
          <Route
            path="/auction/:auctionAddress"
            element={<AuctionComponent auctionAddress />}
          />
          <Route path="/admin" element={<AdminComponent />} />
          <Route path="/manager" element={<ManagerComponent />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default Dapp;
