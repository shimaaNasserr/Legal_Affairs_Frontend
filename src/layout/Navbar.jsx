// src/layout/Navbar.jsx
import React, { useContext, useState, useMemo } from "react";
import "./layout.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGetContractsQuery } from "../services/api";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openNotif, setOpenNotif] = useState(false);

  // Server-side counts for expired and expiring contracts (minimizes payload)
  const { data: expiredResp } = useGetContractsQuery({ expiry: "expired", page: 1, page_size: 1 });
  const { data: expiringResp } = useGetContractsQuery({ expiry: "expiring", page: 1, page_size: 1 });
  const { data: expiringListResp } = useGetContractsQuery({ expiry: "expiring", page: 1, page_size: 5 });
  const expiredCount = typeof expiredResp === "object" ? expiredResp?.count ?? 0 : 0;
  const expiringCount = typeof expiringResp === "object" ? expiringResp?.count ?? 0 : 0;
  const expiringList = (expiringListResp?.results || expiringListResp || []).slice().sort((a, b) => {
    const da = a.end_date ? new Date(a.end_date).getTime() : Number.MAX_SAFE_INTEGER;
    const db = b.end_date ? new Date(b.end_date).getTime() : Number.MAX_SAFE_INTEGER;
    return da - db;
  });

  const totalAlerts = (expiredCount || 0) + (expiringCount || 0);

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
          <span style={{ fontSize: "0.75rem", opacity: 0.8, fontWeight: 400 }}>
            جامعة بورسعيد
          </span>
        </span>
      </div>
      <div className="navbar-right">
        <div className="notification-icon" onClick={() => setOpenNotif((v) => !v)}>
          <i className="ri-notification-3-line"></i>
          {totalAlerts > 0 && (
            <span className="notification-badge">{totalAlerts}</span>
          )}
          {openNotif && (
            <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="notification-header">الإشعارات</div>
              <div className="notification-item">
                <div>
                  <strong>عقود منتهية</strong>
                  <div className="notification-sub">عدد: {expiredCount}</div>
                </div>
                <button
                  className="btn btn-xs btn-link"
                  onClick={() => {
                    setOpenNotif(false);
                    navigate("/contracts", { state: { filter: "expired" } });
                  }}
                >
                  عرض
                </button>
              </div>
              <div className="notification-item">
                <div>
                  <strong>ستنتهي خلال شهرين</strong>
                  <div className="notification-sub">عدد: {expiringCount}</div>
                </div>
                <button
                  className="btn btn-xs btn-link"
                  onClick={() => {
                    setOpenNotif(false);
                    navigate("/contracts", { state: { filter: "expiring" } });
                  }}
                >
                  عرض
                </button>
              </div>
              {expiringList.length > 0 && (
                <>
                  <div className="notification-header">أقرب 5 تواريخ انتهاء</div>
                  {expiringList.map((c) => (
                    <div key={c.id} className="notification-item">
                      <div>
                        <div className="notification-sub">عقد #{c.contract_number || c.general_number || "-"}</div>
                        <div style={{ fontSize: 12 }}>
                          ينتهي في: {c.end_date ? new Date(c.end_date).toLocaleDateString("ar") : "-"}
                        </div>
                      </div>
                      <button
                        className="btn btn-xs btn-link"
                        onClick={() => {
                          setOpenNotif(false);
                          navigate("/contracts", { state: { filter: "expiring" } });
                        }}
                      >
                        فتح
                      </button>
                    </div>
                  ))}
                </>
              )}
              {totalAlerts === 0 && (
                <div className="notification-empty">لا توجد إشعارات</div>
              )}
            </div>
          )}
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
