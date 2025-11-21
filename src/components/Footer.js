import React from "react";
import MuxLogo from "../assets/images/MuxDesignLogo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 mt-10 border-t">
      <div className="text-center text-gray-600 text-sm flex flex-col items-center gap-2">

        <p>
          © {new Date().getFullYear()} Summer Crest Learning Academy
        </p>

        <div className="flex items-center gap-2">
          <img 
            src={MuxLogo} 
            alt="MUX Web Studio Logo" 
            className="h-5 w-auto opacity-80"
          />
          <span className="text-gray-600">
            Website by <span className="font-semibold text-blue-700">MUX Web Studio</span>
          </span>
        </div>

      </div>
    </footer>
  );
}
