const { ethers } = require("ethers");
const AUCABI = require("../contracts/AUC.json");
const AUNFTABI = require("../contracts/AUNFT.json");
const AUCTIONABI = require("../contracts/Auction.json");
const AUCTIONFACTORYABI = require("../contracts/AuctionFactory.json");

const { NFTStorage } = require("nft.storage");

const nftstorage = new NFTStorage({
  token: process.env.REACT_APP_NFT_STORAGE_KEY,
});

const auc_address = "0xEDE39Ccc2831858D04a51199F28f322eE9D0735A";
const auctionFactory_address = "0x3E4B380df195b83552974d98CDEf19519D9AAE72";

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

export const getAUCBalance = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(auc_address, AUCABI.abi, provider);

  const balance = await contract.balanceOf(window.ethereum.selectedAddress);
  return ethers.formatUnits(balance, 18);
};

export const mintAUC = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(auc_address, AUCABI.abi, signer);

  const mintValue = ethers.parseUnits("100", 18);
  const tx = await contract.mint(mintValue);
  await tx.wait();
  return tx.hash;
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
};

export const getAdminFee = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const auctionFactory = new ethers.Contract(
    auctionFactory_address,
    AUCTIONFACTORYABI.abi,
    provider
  );
  const adminFee = await auctionFactory.adminFeePercent();
  return ethers.toNumber(adminFee) / 10;
};

export const createAuction = async (
  nftAddress,
  tokenId,
  startingPrice,
  duration
) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auctionFactory = new ethers.Contract(
    auctionFactory_address,
    AUCTIONFACTORYABI.abi,
    signer
  );

  const nftContract = new ethers.Contract(nftAddress, AUNFTABI.abi, signer);
  const approvetx = await nftContract.approve(auctionFactory.target, tokenId);
  await approvetx.wait();

  const _duration =
    duration.days * 86400 + duration.hours * 3600 + duration.minutes * 60;

  const _startingPrice = ethers.parseUnits(startingPrice, 18);

  const auctionAdrressPromise = new Promise((resolve) => {
    auctionFactory.on("AuctionCreated", (newAuction, event) => {
      event.removeListener();
      resolve(newAuction);
    });
  });

  const tx = await auctionFactory.createAuction(
    nftAddress,
    auc_address,
    tokenId,
    _startingPrice,
    _duration
  );

  await tx.wait();
  const auctionAddress = await auctionAdrressPromise;

  console.log("Auction created at:", auctionAddress);
  return auctionAddress;
};

async function fetchIPFSJSON(ipfsURI) {
  const ipfs = ipfsURI.split("ipfs://")[1];
  const gatewayURL1 = "https://nftstorage.link/ipfs/";
  const gatewayURL2 = "https://";

  try {
    let response = await fetch(gatewayURL1 + ipfs);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    try {
      const response = await fetch(gatewayURL2 + ipfs);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching IPFS JSON:", error);
      return null;
    }
  }
}

export const getOnlyBidInfo = async (auctionAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const auction = new ethers.Contract(auctionAddress, AUCTIONABI.abi, provider);
  const highestBidder = await auction.highestBidder();
  const highestBid = ethers.formatUnits(await auction.highestBid(), 18);
  const ended = await auction.ended();

  return { highestBidder, highestBid, ended };
};

export const getAuction = async (auctionAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const auction = new ethers.Contract(auctionAddress, AUCTIONABI.abi, provider);

  const nftAddress = String(await auction.nft());
  const nft = new ethers.Contract(nftAddress, AUNFTABI.abi, provider);
  const nftName = await nft.name();
  const tokenId = (await auction.tokenId()).toString();
  const URI = await nft.tokenURI(tokenId);
  const metaData = await fetchIPFSJSON(URI);
  if (metaData && metaData.image) {
    if (metaData.image.startsWith("ipfs://")) {
      metaData.image = encodeURI(
        "https://nftstorage.link/ipfs/" + metaData.image.split("ipfs://")[1]
      );
    }
  }
  const auctioneer = await auction.auctioneer();
  const startingPrice = ethers.formatUnits(await auction.startingPrice(), 18);

  const endTime = ethers.toNumber(await auction.endTime());
  const endTimeDate = new Date(endTime * 1000);

  const highestBidder = await auction.highestBidder();
  const highestBid = ethers.formatUnits(await auction.highestBid(), 18);
  const ended = await auction.ended();

  const auctionInfoObj = {
    nftName,
    metaData,
    endTimeDate,
    auctioneer,
    startingPrice,
    highestBidder,
    highestBid,
    ended,
  };
  return auctionInfoObj;
};

export const placeBid = async (auctionAddress, bidAmount) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auction = new ethers.Contract(auctionAddress, AUCTIONABI.abi, signer);

  console.log(bidAmount.toString());

  const bidAmountAUC = ethers.parseUnits(bidAmount, 18);

  const aucAddress = await auction.aucToken();
  const auc = new ethers.Contract(aucAddress, AUCABI.abi, signer);
  const txApprove = await auc.approve(auctionAddress, bidAmountAUC);
  await txApprove.wait();

  console.log("Placing bid of", bidAmountAUC.toString(), "AUC");

  const tx = await auction.placeBid(bidAmountAUC);
  await tx.wait();
  return tx.hash;
};

export const endAuction = async (auctionAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auction = new ethers.Contract(auctionAddress, AUCTIONABI.abi, signer);

  const tx = await auction.endAuction();
  await tx.wait();
  return tx.hash;
};

export const cancellAuction = async (auctionAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auction = new ethers.Contract(auctionAddress, AUCTIONABI.abi, signer);

  const tx = await auction.cancelAuction();
  await tx.wait();
  return tx.hash;
};

export const claimNFT = async (auctionAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auction = new ethers.Contract(auctionAddress, AUCTIONABI.abi, signer);

  const tx = await auction.claimNFT();
  await tx.wait();
  return tx.hash;
};

export const getAddressRole = async () => {
  const manager_role = ethers.keccak256(ethers.toUtf8Bytes("MANAGER_ROLE"));

  const provider = new ethers.BrowserProvider(window.ethereum);
  const auctionFactory = new ethers.Contract(
    auctionFactory_address,
    AUCTIONFACTORYABI.abi,
    provider
  );
  if (
    await auctionFactory.hasRole(
      await auctionFactory.DEFAULT_ADMIN_ROLE(),
      window.ethereum.selectedAddress
    )
  ) {
    return "admin";
  }

  if (
    await auctionFactory.hasRole(manager_role, window.ethereum.selectedAddress)
  ) {
    return "manager";
  }

  return "user";
};

export const changeAdminFee = async (newFee) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auctionFactory = new ethers.Contract(
    auctionFactory_address,
    AUCTIONFACTORYABI.abi,
    signer
  );

  const tx = await auctionFactory.setAdminFeePercent(newFee * 10);
  await tx.wait();
  return tx.hash;
};

export const changeAdminAddress = async (newAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auctionFactory = new ethers.Contract(
    auctionFactory_address,
    AUCTIONFACTORYABI.abi,
    signer
  );

  const tx = await auctionFactory.changeAdmin(newAddress);
  await tx.wait();
  return tx.hash;
};

export const withdrawFees = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auctionFactory = new ethers.Contract(
    auctionFactory_address,
    AUCTIONFACTORYABI.abi,
    signer
  );

  const tx = await auctionFactory.withdrawFees();
  await tx.wait();
  return tx.hash;
};

export const addManager = async (newManagerAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auctionFactory = new ethers.Contract(
    auctionFactory_address,
    AUCTIONFACTORYABI.abi,
    signer
  );

  const tx = await auctionFactory.grantRole(
    await auctionFactory.MANAGER_ROLE(),
    newManagerAddress
  );
  await tx.wait();
  return tx.hash;
};

export const removeManager = async (managerAddress) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const auctionFactory = new ethers.Contract(
    auctionFactory_address,
    AUCTIONFACTORYABI.abi,
    signer
  );

  const tx = await auctionFactory.revokeRole(
    await auctionFactory.MANAGER_ROLE(),
    managerAddress
  );
  await tx.wait();
  return tx.hash;
};
