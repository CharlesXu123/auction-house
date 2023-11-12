import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import MintNFT from "./MintNFT";
import CreateNFTForm from "./CreateNFTForm";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AUAppbar from "./AUAppbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeployContractForm from "./DeployContractForm";

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
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default Dapp;
