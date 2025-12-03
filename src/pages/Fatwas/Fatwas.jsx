import React, { useState, useContext, useMemo } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useGetFatwasQuery, useGetDepartmentsQuery } from "../../services/api";
import { canModifyData } from "../../utils/roles";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    data: fatwasData,
    isLoading: loading,
    error: fatwasError,
  } = useGetFatwasQuery();
  const { data: departments = [] } = useGetDepartmentsQuery();
  const fatwas = fatwasData?.results || fatwasData || [];

  // Handle input changes
  const handleChange = (e) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const resetForm = () => {
    setFormData({
      request_content: "",
      result: "",
      department: "",
      file: null,
    });
    setError("");
  };

  // Submit form
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   try {
  //     const submitData = new FormData();
  //     Object.keys(formData).forEach((key) => {
  //       if (key === "file" && formData.file)
  //         submitData.append("file", formData.file);
  //       else if (formData[key] !== null && formData[key] !== "")
  //         submitData.append(key, formData[key]);
  //     });

  //     if (editingFatwa) {
  //       await axiosInstance.put(`fatwas/${editingFatwa.id}/`, submitData, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });
  //     } else {
  //       await axiosInstance.post("fatwas/", submitData, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });
  //     }

  //     setShowModal(false);
  //     setEditingFatwa(null);
  //     resetForm();
  //     window.location.reload(); // optional: you can refetch instead
  //   } catch (err) {
  //     console.error("Full Axios Error:", err);
  //     // Safely get backend message
  //     const message =
  //       err.response?.data?.detail || // DRF detail
  //       err.response?.data?.message || // sometimes message
  //       err.response?.data || // fallback raw data
  //       err.message || // generic JS error
  //       "فشل في حفظ الفتوى";
  //     setError(message);
  //   }
  // };

  // // Edit fatwa
  // const handleEdit = (fatwa) => {
  //   setEditingFatwa(fatwa);
  //   setFormData({
  //     request_content: fatwa.request_content || "",
  //     result: fatwa.result || "",
  //     department: fatwa.department?.id || fatwa.department || "",
  //     file: null,
  //   });
  //   setShowModal(true);
  //   setError("");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "file" && formData.file)
          submitData.append("file", formData.file);
        else if (formData[key]) submitData.append(key, formData[key]);
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
      // refetch list here instead of reload
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          err.message ||
          "فشل في حفظ الفتوى"
      );
    }
  };

  // Delete fatwa
  const handleDelete = async (fatwaId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الفتوى؟")) return;
    setError("");
    try {
      await axiosInstance.delete(`fatwas/${fatwaId}/`);
      window.location.reload(); // optional: you can remove item from local state instead
    } catch (err) {
      console.error(err);
      setError("فشل في حذف الفتوى");
    }
  };

  // Filter fatwas by search term
  const filteredFatwas = fatwas.filter((fatwa) => {
    const genNum =
      fatwa.general_number != null ? String(fatwa.general_number) : "";
    const requestContent = fatwa.request_content?.toLowerCase() || "";
    const result = fatwa.result?.toLowerCase() || "";
    return (
      genNum.includes(searchTerm) ||
      requestContent.includes(searchTerm.toLowerCase()) ||
      result.includes(searchTerm.toLowerCase())
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFatwas.length / itemsPerPage);
  const paginatedFatwas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFatwas.slice(start, start + itemsPerPage);
  }, [filteredFatwas, currentPage]);

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (fatwasError)
    return <div className="alert alert-danger">فشل في تحميل الفتاوى</div>;

  return (
    <div className="fatwas-page">
      <div className="page-header">
        <h2>إدارة الفتاوى</h2>
        {canModifyData(user) && (
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

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="search-box">
        <i className="ri-search-line"></i>
        <input
          type="text"
          placeholder="بحث في الفتاوى..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset to first page on search
          }}
        />
      </div>

      <div className="fatwas-list">
        {paginatedFatwas.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد فتاوى</p>
          </div>
        ) : (
          paginatedFatwas.map((fatwa) => (
            <div key={fatwa.id} className="fatwa-card">
              <div className="card-header">
                <h3>فتوى رقم {String(fatwa.general_number)}</h3>
                {fatwa.department_name && (
                  <span className="department-badge">
                    {fatwa.department_name}
                  </span>
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
                    href={fatwa.file?.url || fatwa.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    <i className="ri-file-pdf-line"></i> عرض الملف
                  </a>
                )}
              </div>
              {canModifyData(user) && (
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

      {/* Pagination buttons */}
      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              className={`page-btn ${currentPage === idx + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Modal for add/edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingFatwa ? "تعديل فتوى" : "إضافة فتوى جديدة"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
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
                />
              </div>
              <div className="form-group">
                <label>النتيجة</label>
                <textarea
                  name="result"
                  value={formData.result}
                  onChange={handleChange}
                  rows="6"
                />
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
                  {error || String(fatwasError)}
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
