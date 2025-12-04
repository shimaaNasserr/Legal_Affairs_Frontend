import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Cases.css";

const CASE_STATUS_NAMES = {
  pending: "قيد الانتظار",
  under_study: "قيد الدراسة",
  in_court: "قيد التقاضي",
  closed: "منتهية",
  appealed: "قيد الاستئناف",
};

const Cases = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appealNotifications, setAppealNotifications] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchCases = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let data = (await axiosInstance.get("cases/")).data;

      // لو المحامي من إدارة القضايا → يشوف فقط القضايا اللي هو أضافها
      if (user.role === "Lawyer" && user.department_name === "إدارة القضايا") {
        data = data.filter((c) => c.created_by === user.id);
      }

      setCases(data);
      setAppealNotifications(data.filter((c) => c.appeal_status === null));
    } catch (err) {
      console.error("❌ Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [user]);

  const filteredCases = cases.filter((c) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      c.case_number?.toLowerCase().includes(search) ||
      c.lawsuit_number?.toLowerCase().includes(search) ||
      c.plaintiff?.toLowerCase().includes(search) ||
      c.defendant?.toLowerCase().includes(search);

    const matchesStatus = statusFilter === "all" || c.case_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const canEditCase = (c) => {
    if (!user) return false;
    if (user.role === "Lawyer" && user.department_name === "إدارة القضايا")
      return c.created_by === user.id;
    return ["President", "GeneralManager", "DepartmentManager"].includes(user.role);
  };

  const canDeleteCase = (c) => {
    if (!user) return false;
    return ["GeneralManager", "DepartmentManager"].includes(user.role);
  };

  const canAddCase = () => {
    if (!user) return false;
    const deptName = user.department_name || "";
    if (user.role === "Lawyer" && deptName === "إدارة القضايا") return true;
    return ["President", "GeneralManager", "DepartmentManager"].includes(user.role);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/cases/${id}/`);
      setCases((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("فشل حذف القضية", err);
      setConfirmDeleteId(null);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="cases-page">
      <div className="page-header">
        <h2>إدارة القضايا</h2>

        {canAddCase() && (
          <button className="btn btn-primary add-btn" onClick={() => navigate("/select-court")}>
            <i className="ri-add-circle-line"></i> إضافة قضية جديدة
          </button>
        )}
      </div>

      {appealNotifications.length > 0 && (
        <div className="alert alert-warning appeal-alert">
          ⚠ هناك {appealNotifications.length} قضية لم يتم تحديد موقف الطعن لها!
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="بحث في القضايا..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">جميع الحالات</option>
          {Object.entries(CASE_STATUS_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="cases-grid">
        {filteredCases.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد قضايا</p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const hasDivision =
              c.division_name &&
              c.division_name.trim() !== "-" &&
              c.division_name.trim() !== "";

            const courtDisplay = hasDivision
              ? `${c.court_name} - ${c.division_name}`
              : c.court_name;

            return (
              <div key={c.id} className="case-card">
                {/* header */}
                <div className="case-card-header">
                  <h3>
                    {c.plaintiff} vs {c.defendant}
                  </h3>
                  <span className={`status-badge status-${c.case_status}`}>
                    {CASE_STATUS_NAMES[c.case_status]}
                  </span>
                </div>

                {/* body */}
                <div className="case-card-body">
                  <div>
                    <strong>رقم القضية:</strong> {c.case_number}
                  </div>
                  <div>
                    <strong>رقم الحصر العام:</strong> {c.general_number}
                  </div>
                  <div>
                    <strong>رقم الدعوى:</strong> {c.lawsuit_number}
                  </div>
                  <div>
                    <strong>المحكمة:</strong> {courtDisplay}
                  </div>
                  <div>
                    <strong>تاريخ ورود الدعوى:</strong> {c.date_received}
                  </div>
                  <div>
                    <strong>موقف الطعن:</strong>
                    {c.appeal_status === null
                      ? "غير محدد"
                      : c.appeal_status === true
                      ? "تم الطعن"
                      : "لم يتم الطعن"}
                  </div>
                </div>

                {/* actions */}
                <div className="case-card-actions">
                  <button
                    className="btn btn-sm btn-view"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    عرض
                  </button>

                  {canEditCase(c) && (
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => navigate(`/cases/${c.id}/edit`)}
                    >
                      تعديل
                    </button>
                  )}

                  {canDeleteCase(c) && (
                    <>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => setConfirmDeleteId(c.id)}
                      >
                        حذف
                      </button>

                      {confirmDeleteId === c.id && (
                        <div className="confirm-overlay">
                          <div className="confirm-box">
                            <p>هل أنت متأكد من حذف هذه القضية؟</p>
                            <div className="confirm-buttons">
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(c.id)}
                              >
                                نعم
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                لا
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Cases;
