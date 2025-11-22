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
  const [showModal, setShowModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courts, setCourts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [formData, setFormData] = useState({
    date_received: "",
    case_number: "",
    lawsuit_number: "",
    court: "",
    plaintiff: "",
    defendant: "",
    requests: "",
    hearing_dates: "",
    notes: "",
    appeal_status: null,
    case_status: "pending",
    department: "",
    lawyers: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCases();
    fetchCourts();
    fetchDepartments();
    fetchLawyers();
  }, []);

  const fetchCourts = async () => {
    try {
      const res = await axiosInstance.get("courts/");
      setCourts(res.data);
    } catch (err) {
      console.error("Error fetching courts:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("departments/");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchLawyers = async () => {
    try {
      const res = await axiosInstance.get("accounts/users/?role=Lawyer");
      setLawyers(res.data);
    } catch (err) {
      console.error("Error fetching lawyers:", err);
    }
  };

  const fetchCases = async () => {
    try {
      let url = "cases/";
      // الـ Backend يتعامل مع الفلترة تلقائياً حسب الدور
      // لا حاجة لإضافة query parameters

      const res = await axiosInstance.get(url);
      setCases(res.data);
    } catch (err) {
      console.error("Error fetching cases:", err);
      setError("فشل في تحميل القضايا");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingCase) {
        await axiosInstance.put(`cases/${editingCase.id}/`, formData);
      } else {
        await axiosInstance.post("cases/", formData);
      }
      setShowModal(false);
      setEditingCase(null);
      resetForm();
      fetchCases();
    } catch (err) {
      console.error("Error saving case:", err);
      setError(err.response?.data?.message || "فشل في حفظ القضية");
    }
  };

  const handleEdit = (caseItem) => {
    setEditingCase(caseItem);
    setFormData({
      date_received: caseItem.date_received || "",
      case_number: caseItem.case_number || "",
      lawsuit_number: caseItem.lawsuit_number || "",
      court: caseItem.court || "",
      plaintiff: caseItem.plaintiff || "",
      defendant: caseItem.defendant || "",
      requests: caseItem.requests || "",
      hearing_dates: caseItem.hearing_dates || "",
      notes: caseItem.notes || "",
      appeal_status: caseItem.appeal_status,
      case_status: caseItem.case_status || "pending",
      department: caseItem.department || "",
      lawyers: caseItem.lawyers_details?.map(l => l.id) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (caseId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه القضية؟")) return;

    try {
      await axiosInstance.delete(`cases/${caseId}/`);
      fetchCases();
    } catch (err) {
      console.error("Error deleting case:", err);
      setError("فشل في حذف القضية");
    }
  };

  const resetForm = () => {
    setFormData({
      date_received: "",
      case_number: "",
      lawsuit_number: "",
      court: "",
      plaintiff: "",
      defendant: "",
      requests: "",
      hearing_dates: "",
      notes: "",
      appeal_status: null,
      case_status: "pending",
      department: "",
      lawyers: [],
    });
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

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  // فلترة القضايا
  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.case_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.lawsuit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.plaintiff?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.defendant?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || caseItem.case_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="cases-page">
      <div className="page-header">
        <h2>إدارة القضايا</h2>
        {(user?.role === "President" ||
          user?.role === "GeneralManager" ||
          user?.role === "DepartmentManager") && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingCase(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="ri-add-circle-line"></i> إضافة قضية جديدة
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filters">
        <div className="search-box">
          <i className="ri-search-line"></i>
          <input
            type="text"
            placeholder="بحث في القضايا..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
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
          filteredCases.map((caseItem) => (
            <div key={caseItem.id} className="case-card">
              <div className="case-card-header">
                <h3>{caseItem.plaintiff} vs {caseItem.defendant}</h3>
                <span className={getStatusClass(caseItem.case_status)}>
                  {getStatusName(caseItem.case_status)}
                </span>
              </div>

              <div className="case-card-body">
                <p className="case-description">{caseItem.requests || "لا توجد طلبات"}</p>

                <div className="case-details">
                  <div className="detail-item">
                    <i className="ri-hashtag"></i>
                    <span>رقم القضية: {caseItem.case_number || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <i className="ri-hashtag"></i>
                    <span>رقم الدعوى: {caseItem.lawsuit_number || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <i className="ri-building-line"></i>
                    <span>الإدارة: {caseItem.department_name || "-"}</span>
                  </div>
                  {caseItem.court_name && (
                    <div className="detail-item">
                      <i className="ri-government-line"></i>
                      <span>المحكمة: {caseItem.court_name}</span>
                    </div>
                  )}
                  {caseItem.lawyers_details && caseItem.lawyers_details.length > 0 && (
                    <div className="detail-item">
                      <i className="ri-user-star-line"></i>
                      <span>
                        المحامون: {caseItem.lawyers_details.map(l => l.username).join(", ")}
                      </span>
                    </div>
                  )}
                  <div className="detail-item">
                    <i className="ri-calendar-line"></i>
                    <span>
                      تاريخ الاستلام: {caseItem.date_received ? new Date(caseItem.date_received).toLocaleDateString("ar") : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="case-card-actions">
                <button
                  className="btn btn-sm btn-view"
                  onClick={() => navigate(`/cases/${caseItem.id}`)}
                >
                  <i className="ri-eye-line"></i> عرض التفاصيل
                </button>
                {(user?.role === "President" ||
                  user?.role === "GeneralManager" ||
                  user?.role === "DepartmentManager") && (
                  <>
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEdit(caseItem)}
                    >
                      <i className="ri-pencil-line"></i> تعديل
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(caseItem.id)}
                    >
                      <i className="ri-delete-bin-line"></i> حذف
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCase ? "تعديل قضية" : "إضافة قضية جديدة"}</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="case-form">
              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ الاستلام *</label>
                  <input
                    type="date"
                    name="date_received"
                    value={formData.date_received}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>حالة القضية *</label>
                  <select
                    name="case_status"
                    value={formData.case_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="under_study">قيد الدراسة</option>
                    <option value="in_court">قيد التقاضي</option>
                    <option value="closed">منتهية</option>
                    <option value="appealed">قيد الاستئناف</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>رقم القضية *</label>
                  <input
                    type="text"
                    name="case_number"
                    value={formData.case_number}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>رقم الدعوى *</label>
                  <input
                    type="text"
                    name="lawsuit_number"
                    value={formData.lawsuit_number}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>المدعي *</label>
                  <input
                    type="text"
                    name="plaintiff"
                    value={formData.plaintiff}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>المدعى عليه *</label>
                  <input
                    type="text"
                    name="defendant"
                    value={formData.defendant}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>الطلبات *</label>
                <textarea
                  name="requests"
                  value={formData.requests}
                  onChange={handleChange}
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ الجلسات</label>
                  <input
                    type="date"
                    name="hearing_dates"
                    value={formData.hearing_dates}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>حالة الاستئناف</label>
                  <select
                    name="appeal_status"
                    value={formData.appeal_status === null ? "" : formData.appeal_status}
                    onChange={(e) => setFormData({...formData, appeal_status: e.target.value === "" ? null : e.target.value === "true"})}
                  >
                    <option value="">غير محدد</option>
                    <option value="true">قيد الاستئناف</option>
                    <option value="false">غير مستأنف</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>المحكمة</label>
                  <select
                    name="court"
                    value={formData.court}
                    onChange={handleChange}
                  >
                    <option value="">اختر المحكمة</option>
                    {courts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </div>

              <div className="form-group">
                <label>الإدارة</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">اختر الإدارة</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              </div>

              <div className="form-group">
                <label>المحامون</label>
                <select
                  multiple
                  name="lawyers"
                  value={formData.lawyers}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, lawyers: selected});
                  }}
                  style={{minHeight: '100px'}}
                >
                  {lawyers.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.first_name} {lawyer.last_name} ({lawyer.email})
                    </option>
                  ))}
                </select>
                <small>اضغط Ctrl (أو Cmd على Mac) للاختيار المتعدد</small>
              </div>

              <div className="form-group">
                <label>ملاحظات</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingCase ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
