import React, { useState, useContext } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useGetFatwasQuery, useGetDepartmentsQuery } from "../../services/api";
import "./Fatwas.css";

const Fatwas = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingFatwa, setEditingFatwa] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    request_content: "",
    result: "",
    department: "",
    file: null,
  });
  const [error, setError] = useState("");

  // Use cached queries - data is automatically cached and reused
  const { data: fatwasData, isLoading: loading, error: fatwasError } = useGetFatwasQuery();
  const { data: departments = [] } = useGetDepartmentsQuery();
  
  const fatwas = fatwasData?.results || fatwasData || [];

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

      if (editingFatwa) {
        await axiosInstance.put(`fatwas/${editingFatwa.id}/`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("fatwas/", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      setEditingFatwa(null);
      resetForm();
      // Cache will be invalidated by RTK Query if we add mutations
      window.location.reload(); // Temporary: reload to refresh cache
    } catch (err) {
      console.error("Error saving fatwa:", err);
      setError(err.response?.data?.message || "فشل في حفظ الفتوى");
    }
  };

  const handleEdit = (fatwa) => {
    setEditingFatwa(fatwa);
    setFormData({
      request_content: fatwa.request_content || "",
      result: fatwa.result || "",
      department: fatwa.department || "",
      file: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (fatwaId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الفتوى؟")) return;

    try {
      await axiosInstance.delete(`fatwas/${fatwaId}/`);
      // Cache will be invalidated by RTK Query if we add mutations
      window.location.reload(); // Temporary: reload to refresh cache
    } catch (err) {
      console.error("Error deleting fatwa:", err);
      setError("فشل في حذف الفتوى");
    }
  };

  const resetForm = () => {
    setFormData({
      request_content: "",
      result: "",
      department: "",
      file: null,
    });
  };

  const filteredFatwas = fatwas.filter(
    (fatwa) =>
      fatwa.general_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fatwa.request_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fatwa.result?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="fatwas-page">
      <div className="page-header">
        <h2>إدارة الفتاوى</h2>
        {(user?.role === "President" ||
          user?.role === "GeneralManager" ||
          user?.role === "DepartmentManager") && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingFatwa(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="ri-add-circle-line"></i> إضافة فتوى جديدة
          </button>
        )}
      </div>

      {(error || fatwasError) && (
        <div className="alert alert-danger">
          {error || (fatwasError && String(fatwasError))}
        </div>
      )}

      <div className="search-box">
        <i className="ri-search-line"></i>
        <input
          type="text"
          placeholder="بحث في الفتاوى..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="fatwas-list">
        {filteredFatwas.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد فتاوى</p>
          </div>
        ) : (
          filteredFatwas.map((fatwa) => (
            <div key={fatwa.id} className="fatwa-card">
              <div className="card-header">
                <h3>فتوى رقم {fatwa.general_number}</h3>
                {fatwa.department_name && (
                  <span className="department-badge">{fatwa.department_name}</span>
                )}
              </div>
              <div className="fatwa-content">
                <div className="request-section">
                  <h4>محتوى الطلب:</h4>
                  <p>{fatwa.request_content}</p>
                </div>
                {fatwa.result && (
                  <div className="result-section">
                    <h4>النتيجة:</h4>
                    <p>{fatwa.result}</p>
                  </div>
                )}
              </div>
              <div className="card-details">
                {fatwa.created_by_name && (
                  <span>
                    <i className="ri-user-line"></i> {fatwa.created_by_name}
                  </span>
                )}
                {fatwa.created_at && (
                  <span>
                    <i className="ri-calendar-line"></i>{" "}
                    {new Date(fatwa.created_at).toLocaleDateString("ar")}
                  </span>
                )}
                {fatwa.file && (
                  <a
                    href={fatwa.file}
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
                    onClick={() => handleEdit(fatwa)}
                  >
                    <i className="ri-pencil-line"></i> تعديل
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDelete(fatwa.id)}
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
              <h3>{editingFatwa ? "تعديل فتوى" : "إضافة فتوى جديدة"}</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="fatwa-form">
              <div className="form-group">
                <label>محتوى الطلب *</label>
                <textarea
                  name="request_content"
                  value={formData.request_content}
                  onChange={handleChange}
                  rows="6"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>النتيجة</label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleChange}
                  rows="6"
                ></textarea>
              </div>

              <div className="form-group">
                <label>الإدارة *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
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
                <label>رفع ملف الفتوى (PDF)</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleChange}
                />
              </div>

              {(error || fatwasError) && (
        <div className="alert alert-danger">
          {error || (fatwasError && String(fatwasError))}
        </div>
      )}

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingFatwa ? "تحديث" : "إضافة"}
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

export default Fatwas;
