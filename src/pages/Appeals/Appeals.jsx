import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Appeals.css";

const Appeals = () => {
  const { user } = useContext(AuthContext);
  const [appeals, setAppeals] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppeal, setEditingAppeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    investigation: "",
    appeal_number: "",
    appellant_name: "",
    appeal_reason: "",
    date_submitted: "",
    date_reviewed: "",
    status: "submitted",
    decision: "",
    notes: "",
    file: null,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppeals();
    fetchInvestigations();
  }, []);

  const fetchAppeals = async () => {
    try {
      const res = await axiosInstance.get("appeals/");
      setAppeals(res.data);
    } catch (err) {
      console.error("Error fetching appeals:", err);
      setError("فشل في تحميل التظلمات");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestigations = async () => {
    try {
      const res = await axiosInstance.get("investigations/");
      setInvestigations(res.data);
    } catch (err) {
      console.error("Error fetching investigations:", err);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
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
        } else if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      if (editingAppeal) {
        await axiosInstance.put(`appeals/${editingAppeal.id}/`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("appeals/", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      setEditingAppeal(null);
      resetForm();
      fetchAppeals();
    } catch (err) {
      console.error("Error saving appeal:", err);
      setError(err.response?.data?.message || "فشل في حفظ التظلم");
    }
  };

  const handleEdit = (appeal) => {
    setEditingAppeal(appeal);
    setFormData({
      investigation: appeal.investigation || "",
      appeal_number: appeal.appeal_number || "",
      appellant_name: appeal.appellant_name || "",
      appeal_reason: appeal.appeal_reason || "",
      date_submitted: appeal.date_submitted || "",
      date_reviewed: appeal.date_reviewed || "",
      status: appeal.status || "submitted",
      decision: appeal.decision || "",
      notes: appeal.notes || "",
      file: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (appealId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التظلم؟")) return;

    try {
      await axiosInstance.delete(`appeals/${appealId}/`);
      fetchAppeals();
    } catch (err) {
      console.error("Error deleting appeal:", err);
      setError("فشل في حذف التظلم");
    }
  };

  const resetForm = () => {
    setFormData({
      investigation: "",
      appeal_number: "",
      appellant_name: "",
      appeal_reason: "",
      date_submitted: "",
      date_reviewed: "",
      status: "submitted",
      decision: "",
      notes: "",
      file: null,
    });
  };

  const getStatusName = (status) => {
    const statusNames = {
      submitted: "مقدم",
      under_review: "قيد المراجعة",
      accepted: "مقبول",
      rejected: "مرفوض",
      withdrawn: "منسحب",
    };
    return statusNames[status] || status;
  };

  const filteredAppeals = appeals.filter(
    (appeal) =>
      appeal.appeal_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.appellant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.investigation_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="appeals-page">
      <div className="page-header">
        <h2>إدارة التظلمات</h2>
        {(user?.role === "President" ||
          user?.role === "GeneralManager" ||
          user?.role === "DepartmentManager") && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingAppeal(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="ri-add-circle-line"></i> إضافة تظلم جديد
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="search-box">
        <i className="ri-search"></i>
        <input
          type="text"
          placeholder="بحث في التظلمات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="appeals-list">
        {filteredAppeals.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد تظلمات</p>
          </div>
        ) : (
          filteredAppeals.map((appeal) => (
            <div key={appeal.id} className="appeal-card">
              <div className="card-header">
                <h3>{appeal.appellant_name}</h3>
                <span className={`status-badge status-${appeal.status}`}>
                  {getStatusName(appeal.status)}
                </span>
              </div>
              <p className="description">{appeal.appeal_reason}</p>
              <div className="card-details">
                <span>
                  <i className="ri-hashtag"></i> رقم التظلم: {appeal.appeal_number || "-"}
                </span>
                {appeal.investigation_title && (
                  <span>
                    <i className="ri-search"></i> مرتبط بالتحقيق: {appeal.investigation_title}
                    {appeal.investigation_general_number && ` (${appeal.investigation_general_number})`}
                  </span>
                )}
                {appeal.department_name && (
                  <span>
                    <i className="ri-building-line"></i> {appeal.department_name}
                  </span>
                )}
                {appeal.file && (
                  <a
                    href={appeal.file}
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
                    onClick={() => handleEdit(appeal)}
                  >
                    <i className="ri-pencil-line"></i> تعديل
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDelete(appeal.id)}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAppeal ? "تعديل تظلم" : "إضافة تظلم جديد"}</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="appeal-form">
              <div className="form-group">
                <label>التحقيق المرتبط *</label>
                <select
                  name="investigation"
                  value={formData.investigation}
                  onChange={handleChange}
                  required
                >
                  <option value="">اختر تحقيق</option>
                  {investigations.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.title} ({inv.general_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>رقم التظلم</label>
                  <input
                    type="text"
                    name="appeal_number"
                    value={formData.appeal_number}
                    onChange={handleChange}
                    placeholder="سيتم توليده تلقائياً إذا تركته فارغاً"
                  />
                </div>

                <div className="form-group">
                  <label>اسم المستأنف *</label>
                  <input
                    type="text"
                    name="appellant_name"
                    value={formData.appellant_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>سبب الاستئناف *</label>
                <textarea
                  name="appeal_reason"
                  value={formData.appeal_reason}
                  onChange={handleChange}
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ تقديم الاستئناف *</label>
                  <input
                    type="date"
                    name="date_submitted"
                    value={formData.date_submitted}
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
                    <option value="submitted">مقدم</option>
                    <option value="under_review">قيد المراجعة</option>
                    <option value="accepted">مقبول</option>
                    <option value="rejected">مرفوض</option>
                    <option value="withdrawn">منسحب</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>تاريخ المراجعة</label>
                <input
                  type="date"
                  name="date_reviewed"
                  value={formData.date_reviewed}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>القرار</label>
                <textarea
                  name="decision"
                  value={formData.decision}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
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
                <label>رفع ملف التظلم (PDF)</label>
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
                  {editingAppeal ? "تحديث" : "إضافة"}
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

export default Appeals;
