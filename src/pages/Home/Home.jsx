import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
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

  const quickActions = [
    {
      title: "القضايا",
      icon: "ri-file-list-3-line",
      path: "/cases",
      color: "var(--primary-color)",
    },
    {
      title: "التحقيقات",
      icon: "ri-search-line",
      path: "/investigations",
      color: "var(--warning)",
    },
    {
      title: "التظلمات",
      icon: "ri-alert-line",
      path: "/appeals",
      color: "var(--error)",
    },
    {
      title: "العقود",
      icon: "ri-file-text-line",
      path: "/contracts",
      color: "var(--info)",
    },
    {
      title: "الفتاوى",
      icon: "ri-book-open-line",
      path: "/fatwas",
      color: "var(--success)",
    },
  ];

  // إضافة روابط إضافية حسب الدور
  if (user?.role === "President" || user?.role === "GeneralManager") {
    quickActions.push(
      {
        title: "إدارة المستخدمين",
        icon: "ri-team-line",
        path: "/users",
        color: "#64748b",
      },
      {
        title: "التقارير",
        icon: "ri-bar-chart-line",
        path: "/reports",
        color: "var(--secondary-color)",
      }
    );
  }

  if (user?.role === "Lawyer") {
    quickActions.unshift({
      title: "البروفايل",
      icon: "ri-user-settings-line",
      path: "/profile",
      color: "var(--primary-color)",
    });
  }

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
