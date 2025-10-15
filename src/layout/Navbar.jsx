// src/layout/Navbar.jsx
import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./layout.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <i className="bi bi-balance-scale logo"></i>
        <span className="app-name"><svg
            viewBox="0 0 64 64"
            width="70"
            height="70"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <line x1="32" y1="15" x2="32" y2="45" />
              <line x1="22" y1="45" x2="42" y2="45" />
              <line x1="20" y1="20" x2="44" y2="20" />
              <line x1="24" y1="20" x2="20" y2="30" />
              <line x1="40" y1="20" x2="44" y2="30" />
              <ellipse cx="20" cy="32" rx="5" ry="2" stroke="white" fill="none" />
              <ellipse cx="44" cy="32" rx="5" ry="2" stroke="white" fill="none" />
            </g>
          </svg>إدارة الشؤون القانونية </span>
      </div>
      <div className="navbar-right">
        <i className="bi bi-bell"></i>
        <i className="bi bi-person-circle"></i>
      </div>
    </nav>
  );
};

export default Navbar;
