// Footer.js
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1e293b] py-6 text-center text-gray-300 mt-auto">
      <div className="container mx-auto px-4"> {/* Added px-4 */}
        <p>© {currentYear} Flame. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link to="/terms" className="hover:text-white">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;