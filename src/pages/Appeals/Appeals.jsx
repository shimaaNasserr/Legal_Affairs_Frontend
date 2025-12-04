import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  useGetAppealsQuery,
  useGetInvestigationsQuery,
  useCreateAppealMutation,
  useUpdateAppealMutation,
  useDeleteAppealMutation,
} from "../../services/api";
import { canModifyData } from "../../utils/roles";
import "./Appeals.css";

const Appeals = () => {
  const { user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize] = useState(5);
  // Fetch all items for client-side pagination and filtering
  const {
    data: appealsResponse,
    isLoading: loading,
    error: appealsError,
  } = useGetAppealsQuery({
    page_size: 1000, // Fetch a large number to get all items
  });

  // Handle both paginated and non-paginated responses
  const allAppeals = appealsResponse?.results || appealsResponse || [];

  // Filter appeals based on search term
  const filteredAppeals = allAppeals.filter(
    (appeal) =>
      appeal.appeal_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.appellant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.investigation_title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Calculate pagination based on filtered results
  const totalCount = filteredAppeals.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get items for current page (slice filtered results)
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const appeals = filteredAppeals.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  const { data: investigations = [] } = useGetInvestigationsQuery();

  // Mutations with automatic cache invalidation
  const [createAppeal, { isLoading: isCreating }] = useCreateAppealMutation();
  const [updateAppeal, { isLoading: isUpdating }] = useUpdateAppealMutation();
  const [deleteAppeal, { isLoading: isDeleting }] = useDeleteAppealMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingAppeal, setEditingAppeal] = useState(null);

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

  // Normalize backend errors (including field-level validation) into a readable form
  const extractErrorMessages = (err) => {
    const data = err?.data || err?.response?.data || err;
    if (!data) return "حدث خطأ غير متوقع";

    if (typeof data === "string") return data;

    const fieldLabels = {
      investigation: "التحقيق المرتبط",
      appeal_number: "رقم التظلم",
      appellant_name: "اسم المستأنف",
      appeal_reason: "سبب التظلم",
      date_submitted: "تاريخ التقديم",
      date_reviewed: "تاريخ المراجعة",
      status: "الحالة",
      decision: "القرار",
      notes: "الملاحظات",
      file: "ملف التظلم",
    };

    const labelize = (key) => fieldLabels[key] || key;

    const collectMessages = (value, path = []) => {
      if (Array.isArray(value)) {
        return value.flatMap((entry) => collectMessages(entry, path));
      }
      if (value && typeof value === "object") {
        return Object.entries(value).flatMap(([childKey, childValue]) =>
          collectMessages(childValue, [...path, childKey])
        );
      }
      if (value === null || value === undefined || value === "") {
        return [];
      }
      const labelPath = path
        .map((segment) =>
          /^\d+$/.test(segment)
            ? `البند ${Number(segment) + 1}`
            : labelize(segment)
        )
        .join(" → ");
      return [
        labelPath
          ? `${labelPath}: ${value}`
          : typeof value === "string"
          ? value
          : JSON.stringify(value),
      ];
    };

    const mainMessage = data.detail || data.message || null;

    const fieldErrors = Object.entries(data)
      .filter(
        ([key]) => !["detail", "message", "non_field_errors"].includes(key)
      )
      .flatMap(([field, value]) => collectMessages(value, [field]));

    const nonField =
      Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0
        ? data.non_field_errors
        : [];

    const allMessages = [
      ...(mainMessage ? [mainMessage] : []),
      ...nonField,
      ...fieldErrors,
    ];

    if (allMessages.length === 0) {
      return JSON.stringify(data);
    }

    return allMessages.length === 1 ? allMessages[0] : allMessages;
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
        await updateAppeal({
          id: editingAppeal.id,
          formData: submitData,
        }).unwrap();
      } else {
        await createAppeal(submitData).unwrap();
      }
      // Cache is automatically invalidated and refetched by RTK Query
      setShowModal(false);
      setEditingAppeal(null);
      resetForm();
    } catch (err) {
      console.error("Error saving appeal:", err);
      setError(
        extractErrorMessages(err) ||
          err?.data?.message ||
          err?.data?.detail ||
          "فشل في حفظ التظلم"
      );
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
      await deleteAppeal(appealId).unwrap();
      // Cache is automatically invalidated and refetched by RTK Query
    } catch (err) {
      console.error("Error deleting appeal:", err);
      setError(
        extractErrorMessages(err) ||
          err?.data?.message ||
          err?.data?.detail ||
          "فشل في حذف التظلم"
      );
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

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="appeals-page">
      <div className="page-header">
        <h2>إدارة التظلمات</h2>
        {canModifyData(user) && (
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

      {(error || appealsError) && (
        <div className="alert alert-danger">
          {Array.isArray(error) ? (
            <ul className="mb-0">
              {error.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          ) : (
            error ||
            (appealsError && extractErrorMessages(appealsError)) ||
            "فشل في تحميل التظلمات"
          )}
        </div>
      )}

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
        {appeals.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد تظلمات</p>
          </div>
        ) : (
          appeals.map((appeal) => (
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
                  <i className="ri-hashtag"></i> رقم التظلم:{" "}
                  {appeal.appeal_number || "-"}
                </span>
                {appeal.investigation_title && (
                  <span>
                    <i className="ri-search"></i> مرتبط بالتحقيق:{" "}
                    {appeal.investigation_title}
                    {appeal.investigation_general_number &&
                      ` (${appeal.investigation_general_number})`}
                  </span>
                )}
                {appeal.department_name && (
                  <span>
                    <i className="ri-building-line"></i>{" "}
                    {appeal.department_name}
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
              {canModifyData(user) && (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          className="pagination-controls"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "2rem",
            padding: "1rem",
            borderTop: "1px solid #e0e0e0",
            gap: "0.5rem",
          }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                className={`btn btn-sm ${
                  currentPage === pageNum
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  minWidth: "40px",
                  height: "40px",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                }}
              >
                {pageNum}
              </button>
            )
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAppeal ? "تعديل تظلم" : "إضافة تظلم جديد"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
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

              {error && (
                <div className="alert alert-danger">
                  {Array.isArray(error) ? (
                    <ul className="mb-0">
                      {error.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  ) : (
                    error
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating
                    ? "جاري الحفظ..."
                    : editingAppeal
                    ? "تحديث"
                    : "إضافة"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={isCreating || isUpdating}
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
