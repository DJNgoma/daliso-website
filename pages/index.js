import React from "react";
import { FaPodcast, FaCartShopping, FaVrCardboard, FaXTwitter, FaEnvelope, FaUser } from "react-icons/fa6";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-4xl w-full p-6 bg-white shadow-lg rounded-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daliso Ngoma</h1>
        <h2 className="text-lg text-gray-600 mb-6">Entrepreneur | Technologist | Podcast Host</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 180by2 Store Section */}
          <div className="p-4 border rounded-lg shadow-md flex flex-col h-full">
            <FaCartShopping className="text-blue-500 text-4xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">180by2 Store</h2>
            <p className="text-gray-600 mb-6">Explore the best VR gear & tech accessories.</p>
            <a href="https://180by2.co.za" className="mt-auto inline-block w-full text-center bg-blue-500 text-white py-2 rounded-2xl shadow hover:bg-blue-600">Visit Store</a>
          </div>
          
          {/* African Technopreneurs Section */}
          <div className="p-4 border rounded-lg shadow-md flex flex-col h-full">
            <FaVrCardboard className="text-green-500 text-4xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">African Technopreneurs</h2>
            <p className="text-gray-600 mb-6">Leading the charge in VR & tech solutions in Africa.</p>
            <a href="https://africantechno.com" className="mt-auto inline-block w-full text-center bg-green-500 text-white py-2 rounded-2xl shadow hover:bg-green-600">Learn More</a>
          </div>
          
          {/* Podcast Section */}
          <div className="p-4 border rounded-lg shadow-md flex flex-col h-full">
            <FaPodcast className="text-red-500 text-4xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">In It For The Tech</h2>
            <p className="text-gray-600 mb-6">A podcast exploring tech innovations & entrepreneurship.</p>
            <a href="https://www.initforthe.tech" className="mt-auto inline-block w-full text-center bg-red-500 text-white py-2 rounded-2xl shadow hover:bg-red-600">Listen Now</a>
          </div>
          
          {/* Social Media Section */}
          <div className="p-4 border rounded-lg shadow-md flex flex-col h-full">
            <FaXTwitter className="text-black text-4xl mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Follow Me on X</h2>
            <p className="text-gray-600 mb-6">Stay updated with my latest insights.</p>
            <a href="https://x.com/@djngoma" className="mt-auto inline-block w-full text-center bg-black text-white py-2 rounded-2xl shadow hover:bg-gray-800">Follow</a>
          </div>
        </div>
      </div>
    </div>
  );
}
