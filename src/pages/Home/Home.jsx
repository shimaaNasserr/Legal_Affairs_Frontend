import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getRoleBasedLinks } from "../../utils/roles";
import "./Home.css";

export const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

  // الحصول على الروابط المسموحة حسب دور المستخدم (نفس منطق الـ Sidebar)
  const roleLinks = getRoleBasedLinks(user?.role);

  // تحويل الروابط إلى quickActions مع إضافة الألوان
  const getColorForPath = (path) => {
    const colorMap = {
      "/users": "#64748b",
      "/cases": "var(--primary-color)",
      "/investigations": "var(--warning)",
      "/appeals": "var(--error)",
      "/contracts": "var(--info)",
      "/fatwas": "var(--success)",
      "/reports": "var(--secondary-color)",
      "/profile": "var(--primary-color)",
    };
    return colorMap[path] || "var(--primary-color)";
  };

  const quickActions = roleLinks.map((link) => ({
    title: link.label,
    icon: link.icon,
    path: link.to,
    color: getColorForPath(link.to),
  }));

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h1>مرحباً بك، {user?.first_name} {user?.last_name}</h1>
        <p className="role-badge">{getRoleName(user?.role)}</p>
      </div>

      <div className="quick-actions">
        <h2>الإجراءات السريعة</h2>
        <div className="actions-grid">
          {quickActions.map((action) => (
            <div
              key={action.path}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ borderTopColor: action.color }}
            >
              <i className={action.icon} style={{ color: action.color }}></i>
              <h3>{action.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h2>نظام إدارة الشؤون القانونية</h2>
        <p>
          نظام شامل لإدارة القضايا والتحقيقات والتظلمات والعقود والفتاوى
        </p>
      </div>
    </div>
  );
};
