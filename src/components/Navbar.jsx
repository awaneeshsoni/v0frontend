import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../vite.svg"

function Navbar() {
  return (
    <div className="py-4 px-4 text-center md:text-left md:flex md:items-center md:justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center text-white text-2xl font-bold">
          <span>🔥</span>
            Flame
        </Link>
      </div>
  );
}

export default Navbar;
