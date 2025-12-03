// src/layout/Sidebar.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getRoleBasedLinks } from "../utils/roles";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  // روابط مشتركة لجميع المستخدمين
  const commonLinks = [
    { to: "/", icon: "ri-home-4-line", label: "الصفحة الرئيسية" },
  ];

  // الحصول على الروابط حسب الدور
  const roleLinks = [...commonLinks, ...getRoleBasedLinks(user.role)];

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
      </ul>
    </aside>
  );
};

export default Sidebar;
