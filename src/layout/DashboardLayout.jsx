// src/layout/DashboardLayout.jsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./layout.css";
import { Outlet } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      <Navbar onMenuToggle={toggleSidebar} />
      <div className="main-content">
        <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar}></div>
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar />
        </aside>
        <div className="page-content">
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
