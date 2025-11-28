import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Investigations.css";

const Investigations = () => {
  const { user } = useContext(AuthContext);
  const [investigations, setInvestigations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestigation, setEditingInvestigation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    accused_names_input: "",
    date_received: "",
    date_started: "",
    date_completed: "",
    status: "pending",
    priority: "medium",
    case_type: "internal_disciplinary",
    complainant_type: "",
    complainant_name: "",
    complainant_id: "",
    faculty_college: "",
    notes: "",
    findings: "",
    recommendations: "",
    department: "",
    assigned_investigators: [],
    file: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvestigations();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("departments/");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchInvestigations = async () => {
    try {
      const res = await axiosInstance.get("investigations/");
      setInvestigations(res.data);
    } catch (err) {
      console.error("Error fetching investigations:", err);
      setError("فشل في تحميل التحقيقات");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else if (e.target.name === "accused_names_input") {
      // معالجة أسماء المتهمين كقائمة (تدعم الفاصلة العربية والإنجليزية)
      setFormData({ ...formData, accused_names_input: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "file") {
          if (formData.file) {
            submitData.append("file", formData.file);
          }
        } else if (key === "accused_names_input") {
          const names = String(formData.accused_names_input || "")
            .split(/[,،]/)
            .map((n) => n.trim())
            .filter((n) => n);
          names.forEach((name) => {
            submitData.append("accused_names", name); // Changed to accused_names
          });
        } else if (key === "assigned_investigators") {
          // إرسال المحققين كقائمة
          formData.assigned_investigators.forEach((investigatorId) => {
            submitData.append("assigned_investigators", investigatorId);
          });
        } else if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      if (editingInvestigation) {
        await axiosInstance.put(
          `investigations/${editingInvestigation.id}/`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axiosInstance.post("investigations/", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      setEditingInvestigation(null);
      resetForm();
      fetchInvestigations();
    } catch (err) {
      console.error("Error saving investigation:", err);
      setError(err.response?.data?.message || "فشل في حفظ التحقيق");
    }
  };

  const handleEdit = (investigation) => {
    setEditingInvestigation(investigation);
    setFormData({
      title: investigation.title || "",
      description: investigation.description || "",
      accused_names_input: (investigation.accused_names || []).join(", "),
      date_received: investigation.date_received || "",
      date_started: investigation.date_started || "",
      date_completed: investigation.date_completed || "",
      status: investigation.status || "pending",
      priority: investigation.priority || "medium",
      case_type: investigation.case_type || "internal_disciplinary",
      complainant_type: investigation.complainant_type || "",
      complainant_name: investigation.complainant_name || "",
      complainant_id: investigation.complainant_id || "",
      faculty_college: investigation.faculty_college || "",
      notes: investigation.notes || "",
      findings: investigation.findings || "",
      recommendations: investigation.recommendations || "",
      department: investigation.department || "",
      assigned_investigators:
        investigation.assigned_investigators_details?.map((i) => i.id) || [],
      file: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (investigationId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التحقيق؟")) return;

    try {
      await axiosInstance.delete(`investigations/${investigationId}/`);
      fetchInvestigations();
    } catch (err) {
      console.error("Error deleting investigation:", err);
      setError("فشل في حذف التحقيق");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      accused_names_input: "",
      date_received: "",
      date_started: "",
      date_completed: "",
      status: "pending",
      priority: "medium",
      case_type: "internal_disciplinary",
      complainant_type: "",
      complainant_name: "",
      complainant_id: "",
      faculty_college: "",
      notes: "",
      findings: "",
      recommendations: "",
      department: "",
      assigned_investigators: [],
      file: null,
    });
  };

  const getStatusName = (status) => {
    const statusNames = {
      pending: "قيد الانتظار",
      under_investigation: "قيد التحقيق",
      completed: "مكتمل",
      closed: "مغلق",
      appealed: "قيد الاستئناف",
      referred_to_court: "محال للقضاء",
      settled: "تم التسوية",
    };
    return statusNames[status] || status;
  };

  const getPriorityName = (priority) => {
    const priorityNames = {
      low: "منخفضة",
      medium: "متوسطة",
      high: "عالية",
      urgent: "عاجلة",
    };
    return priorityNames[priority] || priority;
  };

  const filteredInvestigations = investigations.filter(
    (inv) =>
      inv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.general_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.complainant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="investigations-page">
      <div className="page-header">
        <h2>إدارة التحقيقات</h2>
        {(user?.role === "President" ||
          user?.role === "GeneralManager" ||
          user?.role === "DepartmentManager") && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingInvestigation(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="ri-add-circle-line"></i> إضافة تحقيق جديد
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="search-box">
        <i className="ri-search-line"></i>
        <input
          type="text"
          placeholder="بحث في التحقيقات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="investigations-list">
        {filteredInvestigations.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد تحقيقات</p>
          </div>
        ) : (
          filteredInvestigations.map((investigation) => (
            <div key={investigation.id} className="investigation-card">
              <div className="card-header">
                <h3>{investigation.title}</h3>
                <div className="badges">
                  <span
                    className={`status-badge status-${investigation.status}`}
                  >
                    {getStatusName(investigation.status)}
                  </span>
                  <span
                    className={`priority-badge priority-${investigation.priority}`}
                  >
                    {getPriorityName(investigation.priority)}
                  </span>
                </div>
              </div>
              <p className="description">{investigation.description}</p>
              <div className="card-details">
                <span>
                  <i className="ri-hashtag"></i> رقم التحقيق:{" "}
                  {investigation.general_number || "-"}
                </span>
                <span>
                  <i className="ri-building-line"></i>{" "}
                  {investigation.department_name || "-"}
                </span>
                {investigation.accused_names_list &&
                  investigation.accused_names_list.length > 0 && (
                    <span>
                      <i className="ri-team-line"></i> المتهمون:{" "}
                      {investigation.accused_names_list.join(", ")}
                    </span>
                  )}
                {investigation.file && (
                  <a
                    href={investigation.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    <i className="ri-file-pdf-line"></i> عرض الملف
                  </a>
                )}
              </div>
              {(user?.role === "President" ||
                user?.role === "GeneralManager" ||
                user?.role === "DepartmentManager") && (
                <div className="card-actions">
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => handleEdit(investigation)}
                  >
                    <i className="ri-pencil-line"></i> تعديل
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDelete(investigation.id)}
                  >
                    <i className="ri-delete-bin-line"></i> حذف
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content large-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                {editingInvestigation ? "تعديل تحقيق" : "إضافة تحقيق جديد"}
              </h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="investigation-form">
              <div className="form-group">
                <label>عنوان التحقيق *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>وصف التحقيق *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                ></textarea>
              </div>

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
                  <label>الحالة *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="under_investigation">قيد التحقيق</option>
                    <option value="completed">مكتمل</option>
                    <option value="closed">مغلق</option>
                    <option value="appealed">قيد الاستئناف</option>
                    <option value="referred_to_court">محال للقضاء</option>
                    <option value="settled">تم التسوية</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>الأولوية *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجلة</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>نوع القضية *</label>
                  <select
                    name="case_type"
                    value={formData.case_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="against_university">ضد الجامعة</option>
                    <option value="by_university">مرفوعة من الجامعة</option>
                    <option value="internal_disciplinary">
                      تأديبية داخلية
                    </option>
                    <option value="academic_misconduct">مخالفة أكاديمية</option>
                    <option value="administrative">إدارية</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>أسماء المتهمين (مفصولة بفواصل)</label>
                <input
                  type="text"
                  name="accused_names_input"
                  value={formData.accused_names_input}
                  onChange={handleChange}
                  placeholder="اسم1, اسم2, اسم3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>نوع المشتكي</label>
                  <select
                    name="complainant_type"
                    value={formData.complainant_type}
                    onChange={handleChange}
                  >
                    <option value="">اختر النوع</option>
                    <option value="student">طالب</option>
                    <option value="faculty_member">عضو هيئة تدريس</option>
                    <option value="employee">موظف</option>
                    <option value="external_party">طرف خارجي</option>
                    <option value="university">الجامعة</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>اسم المشتكي</label>
                  <input
                    type="text"
                    name="complainant_name"
                    value={formData.complainant_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>رقم هوية المشتكي</label>
                  <input
                    type="text"
                    name="complainant_id"
                    value={formData.complainant_id}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>الكلية المعنية</label>
                  <input
                    type="text"
                    name="faculty_college"
                    value={formData.faculty_college}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ بداية التحقيق</label>
                  <input
                    type="date"
                    name="date_started"
                    value={formData.date_started}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>تاريخ انتهاء التحقيق</label>
                  <input
                    type="date"
                    name="date_completed"
                    value={formData.date_completed}
                    onChange={handleChange}
                  />
                </div>
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

              <div className="form-group">
                <label>النتائج</label>
                <textarea
                  name="findings"
                  value={formData.findings}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>التوصيات</label>
                <textarea
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
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

              <div className="form-group">
                <label>رفع ملف التحقيق (PDF)</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleChange}
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingInvestigation ? "تحديث" : "إضافة"}
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

export default Investigations;
