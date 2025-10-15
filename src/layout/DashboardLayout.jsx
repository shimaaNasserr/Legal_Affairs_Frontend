// src/layout/DashboardLayout.jsx
import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./layout.css";
import { Outlet } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="page-content">
            <Outlet/>
        </div>

      </div>
    </div>
  );
};

export default DashboardLayout;
