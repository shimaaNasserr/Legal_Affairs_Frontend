// src/layout/Navbar.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./layout.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGetContractsQuery, useGetAppealsQuery } from "../services/api";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openNotif, setOpenNotif] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const prevTotalRef = useRef(0);

  // Server-side counts for expired and expiring contracts (minimizes payload)
  // Enable auto-refresh every 60s
  const polling = { pollingInterval: 60000, refetchOnMountOrArgChange: true };
  const { data: expiredResp, isFetching: loadingExpired, refetch: refetchExpiredCount } = useGetContractsQuery({ expiry: "expired", page: 1, page_size: 1 }, polling);
  const { data: expiringResp, isFetching: loadingExpiring, refetch: refetchExpiringCount } = useGetContractsQuery({ expiry: "expiring", page: 1, page_size: 1 }, polling);
  const { data: expiringListResp, isFetching: loadingExpiringList, refetch: refetchExpiringList } = useGetContractsQuery({ expiry: "expiring", page: 1, page_size: 5 }, polling);
  const { data: expiredListResp, isFetching: loadingExpiredList, refetch: refetchExpiredList } = useGetContractsQuery({ expiry: "expired", page: 1, page_size: 5 }, polling);
  const expiredCount = typeof expiredResp === "object" ? expiredResp?.count ?? 0 : 0;
  const expiringCount = typeof expiringResp === "object" ? expiringResp?.count ?? 0 : 0;
  const expiringList = (expiringListResp?.results || expiringListResp || []).slice().sort((a, b) => {
    const da = a.end_date ? new Date(a.end_date).getTime() : Number.MAX_SAFE_INTEGER;
    const db = b.end_date ? new Date(b.end_date).getTime() : Number.MAX_SAFE_INTEGER;
    return da - db;
  });

  // Appeals: lightweight recent list to show status summary
  const { data: appealsResp, isFetching: loadingAppeals, refetch: refetchAppeals } = useGetAppealsQuery({ page: 1, page_size: 5 }, polling);
  const appealsList = (appealsResp?.results || appealsResp || []).slice(0, 5);
  const appealsCount = typeof appealsResp === "object" ? (appealsResp?.count ?? appealsList.length) : 0;

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenNotif(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Helpers
  const arabicStatus = (s) => ({
    submitted: 'مقدم',
    under_review: 'قيد المراجعة',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    withdrawn: 'منسحب',
  }[s] || s);

  const relativeDays = (dateStr) => {
    if (!dateStr) return '';
    const end = new Date(dateStr);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const diff = Math.round((end - today) / oneDay);
    if (diff > 0) return `يتبقى ${diff} يوم`;
    if (diff === 0) return 'ينتهي اليوم';
    return `انتهى منذ ${Math.abs(diff)} يوم`;
  };

  // Role-based visibility per section
  const role = user?.role;
  const canSeeContracts = ["President", "GeneralManager", "DepartmentManager"].includes(role);
  const canSeeAppeals = ["President", "GeneralManager", "DepartmentManager", "Lawyer", "Secretary"].includes(role);
  // Badge sums only what the role is allowed to see
  const totalAlerts = (canSeeContracts ? ((expiredCount || 0) + (expiringCount || 0)) : 0) + (canSeeAppeals ? (appealsCount || 0) : 0);

  // Show bell if user can see any section
  const canSeeNotifications = canSeeContracts || canSeeAppeals;

  // Play a short beep using Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880; // A5
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      o.start();
      // quick decay
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      o.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  // Show toast and sound when alerts increase
  useEffect(() => {
    const prev = prevTotalRef.current || 0;
    if (totalAlerts > prev) {
      setShowToast(true);
      playBeep();
      const t = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(t);
    }
    prevTotalRef.current = totalAlerts;
  }, [totalAlerts]);

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
        {canSeeNotifications && (
        <div className="notification-icon" onClick={() => setOpenNotif((v) => !v)}>
          <i className="ri-notification-3-line"></i>
          {totalAlerts > 0 && (
            <span className="notification-badge">{totalAlerts}</span>
          )}
          {openNotif && (
            <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="notification-header">الإشعارات</div>
              {(loadingExpired || loadingExpiring || loadingExpiringList || loadingExpiredList || loadingAppeals) && (
                <div className="notification-item" style={{ opacity: 0.8 }}>
                  <i className="ri-loader-4-line ri-spin" style={{ marginInlineEnd: 6 }}></i>
                  جاري التحديث...
                </div>
              )}
              <div className="notification-item" style={{ justifyContent: 'space-between' }}>
                {canSeeContracts && (
                  <button
                    className="btn btn-xs btn-link"
                    onClick={() => { setOpenNotif(false); navigate('/contracts'); }}
                  >
                    عرض كل العقود
                  </button>
                )}
                <button
                  className="btn btn-xs btn-link"
                  onClick={() => {
                    if (canSeeContracts) {
                      refetchExpiredCount();
                      refetchExpiringCount();
                      refetchExpiringList();
                      refetchExpiredList();
                    }
                    if (canSeeAppeals) refetchAppeals();
                  }}
                  title="تحديث الآن"
                >
                  تحديث الآن
                </button>
              </div>
              {canSeeContracts && (
                <>
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
                  {expiredListResp && (expiredListResp.results || expiredListResp || []).length > 0 && (
                    <>
                      <div className="notification-header">أحدث 5 عقود منتهية</div>
                      {(expiredListResp.results || expiredListResp || []).slice(0,5).map((c) => (
                        <div key={c.id} className="notification-item">
                          <div>
                            <div className="notification-sub">عقد #{c.contract_number || c.general_number || "-"}</div>
                            <div style={{ fontSize: 12 }}>{relativeDays(c.end_date)}</div>
                          </div>
                          <button
                            className="btn btn-xs btn-link"
                            onClick={() => {
                              setOpenNotif(false);
                              navigate("/contracts", { state: { filter: "expired" } });
                            }}
                          >
                            فتح
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                  {expiringList.length > 0 && (
                    <>
                      <div className="notification-header">أقرب 5 تواريخ انتهاء</div>
                      {expiringList.map((c) => (
                        <div key={c.id} className="notification-item">
                          <div>
                            <div className="notification-sub">عقد #{c.contract_number || c.general_number || "-"}</div>
                            <div style={{ fontSize: 12 }}>{relativeDays(c.end_date)}</div>
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
                </>
              )}
              {canSeeAppeals && appealsList.length > 0 && (
                <>
                  <div className="notification-header">موقف الطعن (آخر 5)</div>
                  {appealsList.map((a) => (
                    <div key={a.id} className="notification-item">
                      <div>
                        <div className="notification-sub">
                          {a.investigation_title ? (
                            <>
                              تحقيق: {a.investigation_title}
                              {a.investigation_general_number ? ` (${a.investigation_general_number})` : ""}
                            </>
                          ) : (
                            <>تظلم رقم {a.appeal_number || "-"}</>
                          )}
                        </div>
                        <div style={{ fontSize: 12 }}>الحالة: {arabicStatus(a.status)}</div>
                      </div>
                      <button
                        className="btn btn-xs btn-link"
                        onClick={() => {
                          setOpenNotif(false);
                          navigate("/appeals");
                        }}
                      >
                        فتح
                      </button>
                    </div>
                  ))}
                  <div className="notification-footer" style={{ textAlign: 'center', padding: '6px 0' }}>
                    <button className="btn btn-xs btn-link" onClick={() => { setOpenNotif(false); navigate('/appeals'); }}>عرض كل التظلمات</button>
                  </div>
                </>
              )}
              {totalAlerts === 0 && (
                <div className="notification-empty">لا توجد إشعارات</div>
              )}
            </div>
          )}
        </div>
        )}
        {showToast && (
          <div className="toast-notice">
            <i className="ri-notification-3-line" /> تم تحديث إشعارات العقود
          </div>
        )}
        {user && (
          <div className="user-info">
            <span className="user-name">
              {user.first_name} {user.last_name}
            </span>
            <span className="user-role">{getRoleName(user.role)}</span>
          </div>
        )}
        <button onClick={handleLogout} className="logout-btn">
          <i className="ri-logout-box-r-line"></i>
          <span className="logout-text">تسجيل الخروج</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
