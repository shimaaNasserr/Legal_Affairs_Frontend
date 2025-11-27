// src/layout/Sidebar.jsx
import React, { useContext } from "react";
<<<<<<< HEAD
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role?.name || user?.role || "";
  const canManageUsers = ["president", "general_manager"].includes(role);
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

        <li>
          <NavLink to="/reports" className="nav-item">
            <i className="bi bi-bar-chart"></i> التقارير
          </NavLink>
        </li>
        {canManageUsers && (
          <li>
            <NavLink to="/users" className="nav-item">
              <i className="bi bi-people"></i> المستخدمون
            </NavLink>
          </li>
        )}
=======
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  // روابط مشتركة لجميع المستخدمين
  const commonLinks = [
    { to: "/", icon: "ri-home-4-line", label: "الصفحة الرئيسية" },
  ];

  // روابط حسب الدور
  const getRoleLinks = () => {
    const links = [...commonLinks];

    // رئيس الجامعة ومدير عام: جميع الصفحات
    if (role === ROLES.PRESIDENT || role === ROLES.GENERAL_MANAGER) {
      links.push(
        { to: "/users", icon: "ri-team-line", label: "إدارة المستخدمين" },
        { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
        { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
        { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" },
        { to: "/contracts", icon: "ri-file-text-line", label: "العقود" },
        { to: "/fatwas", icon: "ri-book-open-line", label: "الفتاوى" },
        { to: "/reports", icon: "ri-bar-chart-line", label: "التقارير والإحصائيات" }
      );
    }
    // مدير إدارة: قضايا و تحقيقات و تظلمات إدارته فقط
    else if (role === ROLES.DEPARTMENT_MANAGER) {
      links.push(
        { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
        { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
        { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" },
        { to: "/contracts", icon: "ri-file-text-line", label: "العقود" },
        { to: "/fatwas", icon: "ri-book-open-line", label: "الفتاوى" }
      );
    }
    // محامي: قضاياه وبروفايله
    else if (role === ROLES.LAWYER) {
      links.push(
        { to: "/profile", icon: "ri-user-settings-line", label: "البروفايل" },
        { to: "/cases", icon: "ri-file-list-3-line", label: "قضاياي" }
      );
    }
    // سكرتير: قضايا و تحقيقات و تظلمات
    else if (role === ROLES.SECRETARY) {
      links.push(
        { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
        { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
        { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" }
      );
    }

    return links;
  };

  const roleLinks = getRoleLinks();

  return (
    <aside className="sidebar">
      <ul>
        {roleLinks.map((link) => (
          <li key={link.to}>
            <NavLink to={link.to} className="nav-item">
              <i className={link.icon}></i>
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
>>>>>>> 6590e2905c3fadac5933a2ce6732f1103311bb2e
      </ul>
    </aside>
  );
};

export default Sidebar;
