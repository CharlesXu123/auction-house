const { ethers } = require("ethers");
const contractABI = require("../contracts/AUC.json");
const AUNFTABI = require("../contracts/AUNFT.json");

const { NFTStorage } = require("nft.storage");

const nftstorage = new NFTStorage({
  token: process.env.REACT_APP_NFT_STORAGE_KEY,
});

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "connected",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: "no metamask detected",
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "connected",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: "no metamask detected",
    };
  }
};

export const test = async () => {
  const contractAddress = "0xb3828aF7F16edbeEEf43B5403871a5d979efA521";
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    contractAddress,
    contractABI.abi,
    signer
  );

  const res = await contract.transfer(
    "0x9c877A5BB5DA2A98BE02926Db88Aa1ed19AEe883",
    100
  );
  console.log("res: ", res.toString());
  return res;
};

export const createNFTContract = async (name, symbol) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const AUNFT = new ethers.ContractFactory(
    AUNFTABI.abi,
    AUNFTABI.bytecode,
    signer
  );

  const aunft = await AUNFT.deploy(name, symbol);
  aunft.waitForDeployment();
  console.log("AUC deployed to:", aunft.target);
  return aunft.target;
};

export const mintNFTToken = async (
  contractAddress,
  name,
  description,
  file
) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, AUNFTABI.abi, signer);

  const token = await nftstorage.store({
    image: file,
    name,
    description,
  });

  // contract.on("MetadataUpdate", (_tokenId, event) => {
  //   console.log("MetadataUpdate: ", _tokenId);
  //   tokenId = _tokenId;
  //   event.removeListener();
  // });

  const tokenIdPromise = new Promise((resolve) => {
    contract.on("MetadataUpdate", (_tokenId, event) => {
      event.removeListener();
      resolve(_tokenId);
    });
  });

  const tx = await contract.safeMint(
    window.ethereum.selectedAddress,
    token.url
  );

  await tx.wait();
  const hash = tx.hash;

  // Wait for the promise to resolve
  const tokenIdNumber = await tokenIdPromise;
  const tokenId = tokenIdNumber.toString();

  return { hash, tokenId };

  // Get the event from the transaction receipt
  // const filter = contract.filters.MetadataUpdate();
  // const events = await contract.queryFilter(filter, -100);
  // console.log("events: ", events);

  // // If the event is found, extract the tokenId
  // if (events.length > 0) {
  //   const tokenId = events[0].args._tokenId;
  //   console.log("MetadataUpdate: ", tokenId);
  //   // You can now use the tokenId as needed
  // }
};
