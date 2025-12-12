import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  ABI,
  connectWallet,
  getProvider,
  getContract
} from "../utils/contract";

const fade = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const glass =
  "backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)]";

const glowBtn =
  "px-5 py-3 rounded-xl font-semibold text-black bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_20px_rgba(255,184,0,0.4)] hover:shadow-[0_0_28px_rgba(255,184,0,0.7)] transition-all";

export default function Home() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [amount, setAmount] = useState("0.001");
  const [message, setMessage] = useState("You're awesome ☕🔥");
  const [chais, setChais] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const p = getProvider();
    if (p) setProvider(p);
    fetchChais();
  }, []);

  async function handleConnect() {
    try {
      const { provider: p, signer: s } = await connectWallet();
      setProvider(p);
      setSigner(s);
      setAccount(await s.getAddress());
    } catch (err) {
      alert(err.message);
    }
  }

  async function buyChai() {
    try {
      if (!signer) await handleConnect();

      const ct = getContract(signer);
      const tx = await ct.buyChai(message, {
        value: ethers.parseEther(amount)
      });

      await tx.wait();
      setStatus("Chai bought successfully!");
      fetchChais();
    } catch (e) {
      alert(e.message);
    }
  }

  async function fetchChais() {
    try {
      const p = getProvider();
      if (!p) return;

      const ct = getContract(p);
      const count = Number(await ct.getChaiCount());
      const list = [];

      for (let i = 0; i < count; i++) {
        const c = await ct.getChai(i);
        list.push({
          from: c[0],
          amount: ethers.formatEther(c[1]),
          message: c[2],
          timestamp: Number(c[3])
        });
      }

      setChais(list.reverse());
    } catch (e) {
      console.log(e);
    }
  }

  async function withdraw() {
    try {
      if (!signer) await handleConnect();

      const ct = getContract(signer);
      const tx = await ct.withdraw();
      await tx.wait();

      setStatus("Withdrawal complete!");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937, #0f172a)] text-white flex items-center justify-center p-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fade}
        className="max-w-6xl w-full grid md:grid-cols-2 gap-10"
      >
        {/* LEFT → MAIN CARD */}
        <motion.div variants={fade} className={`p-10 rounded-3xl ${glass}`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black text-3xl font-bold shadow-xl">
              ☕
            </div>
            <div>
              <h1 className="text-3xl font-bold">Buy Me a Chai</h1>
              <p className="text-slate-300 text-sm">
                Support the dev by sending a chai on the Ethereum testnet.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            {/* Inputs */}
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in ETH"
              className="w-full p-4 rounded-xl bg-white/5 border border-white/20 outline-none focus:border-orange-400 transition"
            />

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              className="w-full p-4 rounded-xl bg-white/5 border border-white/20 outline-none focus:border-orange-400 transition"
            />

            <div className="flex gap-3">
              <button onClick={buyChai} className={glowBtn}>
                Buy Chai
              </button>

              <button
                onClick={handleConnect}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
              >
                {account ? account.slice(0, 6) + "..." + account.slice(-4) : "Connect"}
              </button>

              <button
                onClick={withdraw}
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
              >
                Withdraw
              </button>
            </div>

            {status && <div className="text-sm text-green-400">{status}</div>}

            <div className="mt-10">
              <h3 className="text-sm text-slate-300">Contract QR</h3>
              <div className="mt-4 bg-white p-3 rounded-xl inline-block shadow-xl">
                <QRCode value={CONTRACT_ADDRESS} size={130} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT → CHAI FEED */}
        <motion.div variants={fade} className={`p-10 rounded-3xl ${glass}`}>
          <h2 className="text-2xl font-bold mb-6">Recent Chais</h2>

          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
            {chais.length === 0 && (
              <div className="text-slate-400 text-sm">No chais yet — be the first!</div>
            )}

            {chais.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl"
              >
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{c.from.slice(0, 6)}...{c.from.slice(-4)}</span>
                  <span>{new Date(c.timestamp * 1000).toLocaleString()}</span>
                </div>
                <div className="mt-3 text-lg font-semibold">{c.message}</div>
                <div className="mt-1 text-sm text-orange-300">{c.amount} ETH</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
