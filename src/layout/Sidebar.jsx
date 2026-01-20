// src/layout/Sidebar.jsx
import React, { useContext } from "react";
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

    // رئيس الجامعة: جميع الصفحات بما في ذلك الإحصائيات
    if (role === ROLES.PRESIDENT) {
      links.push(
        { to: "/users", icon: "ri-team-line", label: "إدارة المستخدمين" },
        { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
        { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
        { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" },
        { to: "/contracts", icon: "ri-file-text-line", label: "العقود" },
        { to: "/fatwas", icon: "ri-book-open-line", label: "الفتاوى" },
        {
          to: "/reports",
          icon: "ri-bar-chart-line",
          label: "التقارير والإحصائيات",
        }
      );
    }
    // مدير عام: جميع الصفحات ما عدا الإحصائيات
    else if (role === ROLES.GENERAL_MANAGER) {
      links.push(
        { to: "/users", icon: "ri-team-line", label: "إدارة المستخدمين" },
        { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" },
        { to: "/investigations", icon: "ri-search-line", label: "التحقيقات" },
        { to: "/appeals", icon: "ri-alert-line", label: "التظلمات" },
        { to: "/contracts", icon: "ri-file-text-line", label: "العقود" },
        { to: "/fatwas", icon: "ri-book-open-line", label: "الفتاوى" }
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
    // محامي: الصفحة الرئيسية والقضايا فقط
    else if (role === ROLES.LAWYER) {
      links.push(
        { to: "/cases", icon: "ri-file-list-3-line", label: "قضايا" }
      );
    }
    // سكرتير: الصفحة الرئيسية والقضايا فقط
    else if (role === ROLES.SECRETARY) {
      links.push(
        { to: "/cases", icon: "ri-file-list-3-line", label: "القضايا" }
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
            <NavLink to={link.to} state={link.state} className="nav-item">
              <i className={link.icon}></i>
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
