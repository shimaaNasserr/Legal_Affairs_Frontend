<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import axiosInstance from "../../apis/axiosInstance";
import CourtsPage from "../Courts/CourtsPage";
import AddCaseForm from "./AddCaseForm";
import "./caseStyles.css";

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [unresolvedAppeals, setUnresolvedAppeals] = useState([]);

  // Fetch cases
  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await axiosInstance.get("/cases/");
        setCases(res.data);
        setUnresolvedAppeals(res.data.filter((c) => c.appeal_status === null));
      } catch (err) {
        console.error("Error fetching cases:", err);
      }
    }
    fetchCases();
  }, []);

  const handleCaseAdded = (newCase) => {
    setCases((prev) => [newCase, ...prev]);
    if (newCase.appeal_status === null) {
      setUnresolvedAppeals((prev) => [...prev, newCase]);
    }
  };

  return (
    <div className="cases-page">
      {unresolvedAppeals.length > 0 && (
        <div className="notification">
          هناك {unresolvedAppeals.length} قضية لم يتم تحديد موقف الطعن فيها!
        </div>
      )}

      {!showForm && (
        <button
          className="add-case-btn"
          onClick={() => setShowForm(true)}
        >
          إضافة قضية جديدة
        </button>
      )}

      {showForm && !selectedCourt && (
        <CourtsPage
          onSelectCourt={(court) => setSelectedCourt(court)}
        />
      )}

      {showForm && selectedCourt && (
        <AddCaseForm
          selectedCourt={selectedCourt}
          onCaseAdded={handleCaseAdded}
          onCancel={() => {
            setSelectedCourt(null);
            setShowForm(false);
          }}
        />
      )}

      <div className="cases-grid">
        {cases.map((c) => (
          <div className="case-card" key={c.id}>
            <h4>
              {c.case_number} - {c.plaintiff} vs {c.defendant}
            </h4>
            <p>تاريخ ورود الدعوى: {c.date_received}</p>
            <p>رقم الحصر العام: {c.general_case_number}</p>
            <p>رقم حصر القضايا: {c.case_index_number}</p>
            <p>رقم الدعوى والسنة القضائية: {c.lawsuit_number}</p>
            <p>المحكمة: {c.court?.name || "غير محددة"}</p>
            <p>اسم المدعي: {c.plaintiff}</p>
            <p>اسم المدعى عليه: {c.defendant}</p>
            <p>الطلبات: {c.requests}</p>
            <p>تاريخ الجلسات: {c.session_dates}</p>
            <p>الحكم الصادر: {c.verdict}</p>
            <p>
              موقف الدعوى من الطعن:{" "}
              {c.appeal_status === true
                ? "تم الطعن"
                : c.appeal_status === false
                ? "لم يتم الطعن"
                : "غير محدد"}
            </p>
            <p>تاريخ الحفظ: {c.saved_date}</p>
            <p>ملاحظات الدعوى: {c.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
=======
import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Cases.css";

const Cases = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appealNotifications, setAppealNotifications] = useState([]);

  const fetchCases = async () => {
    try {
      const res = await axiosInstance.get("cases/");
      setCases(res.data);

      const pendingAppeals = res.data.filter(c => c.appeal_status === null);
      setAppealNotifications(pendingAppeals);
    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // =====================================
  // فتح الفورم للتعديل
  // =====================================
  const handleEdit = (caseItem) => {
    const divisionNameQuery = caseItem.division_name
      ? `?divisionName=${encodeURIComponent(caseItem.division_name)}`
      : "";
    navigate(`/add-case/${caseItem.court}/${caseItem.id}${divisionNameQuery}`, {
      state: { caseId: caseItem.id }
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
    const matchesStatus = statusFilter === "all" || c.case_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="cases-page">
      <div className="page-header">
        <h2>إدارة القضايا</h2>
        <button className="btn btn-primary" onClick={() => navigate("/select-court")}>
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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
                  <h3>{c.plaintiff} vs {c.defendant}</h3>
                  <span className={getStatusClass(c.case_status)}>
                    {getStatusName(c.case_status)}
                  </span>
                
                </div>
                <div className="case-card-body">
                  <div><strong>رقم القضية:</strong> {c.case_number}</div>
                  <div><strong>رقم الحصر العام:</strong> {c.general_number}</div>
                  <div><strong>رقم الدعوى:</strong> {c.lawsuit_number}</div>
                  <div><strong>المحكمة:</strong>{courtAndDepartment}</div>                  
                  <div><strong>تاريخ ورود الدعوى:</strong> {c.date_received}</div>
                  <div><strong>موقف الطعن:</strong> {c.appeal_status === null ? "غير محدد" : (c.appeal_status === true || c.appeal_status === "true") ? "تم الطعن" : "لم يتم الطعن"}</div>
                </div>
                <div className="case-card-actions">
                  <button className="btn btn-sm btn-view" onClick={() => handleDetails(c)}>
                    <i className="ri-eye-line"></i> تفاصيل
                  </button>
                  {(user?.role === "President" || user?.role === "GeneralManager" || user?.role === "DepartmentManager") && (
                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(c)}>
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
>>>>>>> 6590e2905c3fadac5933a2ce6732f1103311bb2e
