import { ethers } from "ethers";

// Replace with deployed contract address from chai-contract
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const ABI = [
  "event ChaiBought(address indexed from, uint256 amount, string message, uint256 timestamp)",
  "function buyChai(string calldata message) external payable",
  "function getChaiCount() external view returns (uint256)",
  "function getChai(uint256 index) external view returns (address,uint256,string,uint256)",
  "function withdraw() external"
];

export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}

export async function connectWallet() {
  const provider = getProvider();
  if (!provider) throw new Error("No injected wallet found");
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}
