// src/layout/Navbar.jsx
import React, { useContext, useState } from "react";
import "./layout.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleName = (role) => {
    const roleNames = {
      President: "رئيس الجامعة",
      GeneralManager: "مدير عام",
      DepartmentManager: "مدير إدارة",
      Lawyer: "محامي",
      Secretary: "سكرتير",
    };
    return roleNames[role] || role;
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-toggle" onClick={onMenuToggle}>
          <i className="ri-menu-line"></i>
        </button>
        <div className="logo">
          <i className="ri-scales-3-line"></i>
        </div>
        <span className="app-name">
          <span>إدارة الشؤون القانونية</span>
          <span style={{fontSize: '0.75rem', opacity: 0.8, fontWeight: 400}}>جامعة بورسعيد</span>
        </span>
      </div>
      <div className="navbar-right">
        <div className="notification-icon">
          <i className="ri-notification-3-line"></i>
        </div>
        {user && (
          <div className="user-info">
            <span className="user-name">
              {user.first_name} {user.last_name}
            </span>
            <span className="user-role">{getRoleName(user.role)}</span>
          </div>
        )}
        <div className="profile-icon">
          <i className="ri-user-3-line"></i>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <i className="ri-logout-box-r-line"></i>
          <span className="logout-text">تسجيل الخروج</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
