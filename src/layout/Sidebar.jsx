// src/layout/Sidebar.jsx
import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul>
        <li>
          <NavLink to="/" className="nav-item">
            <i className="bi bi-house-door"></i> الصفحة الرئيسية
          </NavLink>
        </li>

        <li>
          <NavLink to="/cases" className="nav-item">
            <i className="bi bi-briefcase"></i> القضايا
          </NavLink>
        </li>

        <li>
          <NavLink to="/investigations" className="nav-item">
            <i className="bi bi-search"></i> التحقيقات
          </NavLink>
        </li>

        <li>
          <NavLink to="/appeals" className="nav-item">
            <i className="bi bi-exclamation-circle"></i> التظلمات
          </NavLink>
        </li>

        <li>
          <NavLink to="/contracts" className="nav-item">
            <i className="bi bi-file-earmark-text"></i> العقود
          </NavLink>
        </li>

        <li>
          <NavLink to="/fatwas" className="nav-item">
            <i className="bi bi-journal-text"></i> الفتاوى
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
