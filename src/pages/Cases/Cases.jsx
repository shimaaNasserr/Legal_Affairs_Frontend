import React, { useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGetCasesQuery } from "../../services/api";
import "./Cases.css";

const Cases = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Use cached query - data is automatically cached and reused
  const { data: casesData, isLoading: loading, error } = useGetCasesQuery();
  const cases = casesData?.results || casesData || [];

  // Calculate appeal notifications from cached data
  const appealNotifications = useMemo(() => {
    return cases.filter((c) => c.appeal_status === null);
  }, [cases]);

  // =====================================
  // فتح الفورم للتعديل
  // =====================================
  const handleEdit = (caseItem) => {
    const divisionNameQuery = caseItem.division_name
      ? `?divisionName=${encodeURIComponent(caseItem.division_name)}`
      : "";
    navigate(`/add-case/${caseItem.court}/${caseItem.id}${divisionNameQuery}`, {
      state: { caseId: caseItem.id },
    });
  };

  const handleDetails = (caseItem) => {
    navigate(`/cases/${caseItem.id}`);
  };

  const getStatusName = (status) => {
    const statusNames = {
      pending: "قيد الانتظار",
      under_study: "قيد الدراسة",
      in_court: "قيد التقاضي",
      closed: "منتهية",
      appealed: "قيد الاستئناف",
    };
    return statusNames[status] || status;
  };

  const getStatusClass = (status) => `status-badge status-${status}`;

  const filteredCases = cases.filter((c) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      c.case_number?.toLowerCase().includes(search) ||
      c.lawsuit_number?.toLowerCase().includes(search) ||
      c.plaintiff?.toLowerCase().includes(search) ||
      c.defendant?.toLowerCase().includes(search);
    const matchesStatus =
      statusFilter === "all" || c.case_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="cases-page">
      <div className="page-header">
        <h2>إدارة القضايا</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/select-court")}
        >
          <i className="ri-add-circle-line"></i> إضافة قضية جديدة
        </button>
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="under_study">قيد الدراسة</option>
          <option value="in_court">قيد التقاضي</option>
          <option value="closed">منتهية</option>
          <option value="appealed">قيد الاستئناف</option>
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
            const courtDisplay = c.division_name
              ? `${c.court_name} - ${c.division_name}`
              : c.court_name;

            const courtAndDepartment = c.department?.name
              ? `${courtDisplay} (${c.department.name})`
              : courtDisplay;

            return (
              <div key={c.id} className="case-card">
                <div className="case-card-header">
                  <h3>
                    {c.plaintiff} vs {c.defendant}
                  </h3>
                  <span className={getStatusClass(c.case_status)}>
                    {getStatusName(c.case_status)}
                  </span>
                </div>
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
                    <strong>المحكمة:</strong>
                    {courtAndDepartment}
                  </div>
                  <div>
                    <strong>تاريخ ورود الدعوى:</strong> {c.date_received}
                  </div>
                  <div>
                    <strong>موقف الطعن:</strong>{" "}
                    {c.appeal_status === null
                      ? "غير محدد"
                      : c.appeal_status === true || c.appeal_status === "true"
                      ? "تم الطعن"
                      : "لم يتم الطعن"}
                  </div>
                </div>
                <div className="case-card-actions">
                  <button
                    className="btn btn-sm btn-view"
                    onClick={() => handleDetails(c)}
                  >
                    <i className="ri-eye-line"></i> تفاصيل
                  </button>
                  {(user?.role === "President" ||
                    user?.role === "GeneralManager" ||
                    user?.role === "DepartmentManager") && (
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEdit(c)}
                    >
                      <i className="ri-pencil-line"></i> تعديل
                    </button>
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
