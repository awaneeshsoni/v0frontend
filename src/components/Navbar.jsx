import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'text-blue-700 font-bold'
      : 'text-gray-500 hover:text-blue-700';

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-medium text-blue-500">LOGO</div>
        <div className="space-x-8">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact Us
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
