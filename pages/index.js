import React from "react";
import { motion } from "framer-motion";
import { FaShoppingCart, FaPodcast, FaVrCardboard } from "react-icons/fa";
import { PiXLogoBold } from "react-icons/pi";

export default function HomePage() {
  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1>Daliso Ngoma</h1>
        <p>Entrepreneur | Technologist | Podcast Host</p>

        <div className="grid">
          <div className="card">
            <FaShoppingCart className="icon" />
            <h2>180by2 Store</h2>
            <p>Explore the best VR gear & tech accessories.</p>
            <button onclick="window.open('https://180by2.co.za', '_blank')">Visit Store</button>
          </div>

          <div className="card">
            <FaVrCardboard className="icon" />
            <h2>African Technopreneurs</h2>
            <p>Leading the charge in VR & tech solutions in Africa.</p>
            <button onclick="window.open('https://africantechno.com', '_blank')">Learn More</button>
          </div>

          <div className="card">
            <FaPodcast className="icon" />
            <h2>In It For The Tech</h2>
            <p>A podcast exploring tech innovations & entrepreneurship.</p>
            <button onclick="window.open('https://www.initforthe.tech', '_blank')">Listen Now</button>
          </div>

          <div className="card">
            <PiXLogoBold className="icon" />
            <h2>Follow Me on X</h2>
            <p>Stay updated with my latest insights.</p>
            <button onclick="window.open('https://x.com/@djngoma', '_blank')">Follow</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
