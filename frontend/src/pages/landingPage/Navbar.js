import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../assets/logos/logo.png";
import Link from "next/link";
import walletConnectFcn from "@/components/walletConnect";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [account, setAccount] = useState();
  const [provider, setProvider] = useState();
  const router = useRouter();
  
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    // Check if wallet is already connected on component mount
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(undefined);
      setProvider(undefined);
    } else {
      // Account changed
      setAccount(accounts[0]);
    }
  };

  const connectWallet = async () => {
    try {
      const wallet = walletConnectFcn();
      const [newAccount, newProvider, network] = await wallet.connect();
      setAccount(newAccount);
      setProvider(newProvider);
      console.log(`🔌 Account ${newAccount} connected ⚡ ✅`);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      setAccount(undefined);
      setProvider(undefined);
      console.log("Wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <nav className="container flex justify-between items-center mx-auto px-8 py-4 lg:relative">
      {/* Logo and Brand Name */}
      <Link href="/" passHref>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center cursor-pointer"
        >
          <Image src={logo} alt="TicketPassX Logo" className="h-8 mr-2" />
          <span className="text-white font-semibold text-lg">TicketPassX</span>
        </motion.div>
      </Link>

      {/* Hamburger Button */}
      <button
        className="md:hidden text-white hover:text-[#F5167E] focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Navigation Links */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:flex md:items-center md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-black/30 md:bg-transparent p-4 md:p-0 z-10`}
      >
        <Link
          href="/create"
          className="block md:inline-block text-white hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
          onClick={toggleMenu}
        >
          Create
        </Link>
        <Link
          href="/events"
          className="block md:inline-block text-white hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
          onClick={toggleMenu}
        >
          All Events
        </Link>
        <Link
          href="/my-tickets"
          className="block md:inline-block text-white hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
          onClick={toggleMenu}
        >
          My Tickets
        </Link>

        {/* Wallet Button */}
        {account ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={disconnectWallet}
            className="text-white px-4 py-2 rounded-full transition-colors duration-200 bg-red-600/30 hover:bg-red-700 ring-2 ring-white ring-opacity-50 hover:ring-opacity-75 ml-4"
          >
            {`${account.slice(0, 6)}...${account.slice(-4)} ⚡`}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={connectWallet}
            className="text-white px-4 py-2 rounded-full transition-colors duration-200 ring-2 ring-white ring-opacity-50 hover:ring-opacity-75 bg-purple-800/30 hover:bg-purple-900"
          >
            Connect Wallet
          </motion.button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;