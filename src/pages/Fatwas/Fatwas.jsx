import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  useGetFatwasQuery,
  useGetDepartmentsQuery,
  useCreateFatwaMutation,
  useUpdateFatwaMutation,
  useDeleteFatwaMutation,
} from "../../services/api";
import "./Fatwas.css";

const Fatwas = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: request, 2: result, 3: department/file
  const [editingFatwa, setEditingFatwa] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    request_content: "",
    result: "",
    department: "",
    file: null,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // RTK Query hooks
  const {
    data: fatwasData,
    isLoading: loading,
    error: fatwasError,
  } = useGetFatwasQuery({ page, page_size: pageSize });
  const { data: departments = [] } = useGetDepartmentsQuery();
  const [createFatwa] = useCreateFatwaMutation();
  const [updateFatwa] = useUpdateFatwaMutation();
  const [deleteFatwa] = useDeleteFatwaMutation();

  const fatwas = fatwasData?.results || fatwasData || [];
  const totalCount =
    typeof fatwasData === "object" && fatwasData
      ? fatwasData.count ?? fatwas.length
      : fatwas.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleChange = (e) => {
    const { name, files, value } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (fieldErrors?.[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Validate all steps before submit
    const v1 = validateStep(1);
    const v2 = validateStep(2); // optional but run to clear messages
    const v3 = validateStep(3);
    if (!v1) {
      setCurrentStep(1);
      return;
    }
    if (!v3) {
      setCurrentStep(3);
      return;
    }

    try {
      setSubmitting(true);
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
        await updateFatwa({
          id: editingFatwa.id,
          formData: submitData,
        }).unwrap();
      } else {
        await createFatwa(submitData).unwrap();
      }
      setShowModal(false);
      setEditingFatwa(null);
      resetForm();
    } catch (err) {
      console.error("Error saving fatwa:", err);
      const data = err?.data;
      const apiDetail = data?.detail || data?.message;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const fe = {};
        Object.entries(data).forEach(([k, v]) => {
          if (k === "detail" || k === "message") return;
          fe[k] = Array.isArray(v) ? v.join("، ") : String(v);
        });
        if (Object.keys(fe).length) setFieldErrors(fe);
      }
      setError(apiDetail || "فشل في حفظ الفتوى");
    } finally {
      setSubmitting(false);
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
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleDelete = async (fatwaId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الفتوى؟")) return;

    try {
      await deleteFatwa(fatwaId).unwrap();
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
    setFieldErrors({});
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.request_content) errs.request_content = "هذا الحقل مطلوب";
    } else if (step === 3) {
      if (!formData.department) errs.department = "هذا الحقل مطلوب";
      // file optional
    }
    setFieldErrors((prev) => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep(1)) setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      // Step 2 has no required fields
      setCurrentStep(3);
      return;
    }
  };

  const filteredFatwas = fatwas.filter((fatwa) => {
    const term = (searchTerm || "").toLowerCase();
    const nameTerm = (nameFilter || "").toLowerCase();
    const generalNumberStr = String(fatwa.general_number ?? "").toLowerCase();
    const requestContentStr = String(fatwa.request_content ?? "").toLowerCase();
    const resultStr = String(fatwa.result ?? "").toLowerCase();

    const matchesSearch =
      generalNumberStr.includes(term) ||
      requestContentStr.includes(term) ||
      resultStr.includes(term);

    const matchesName =
      !nameTerm ||
      generalNumberStr.includes(nameTerm) ||
      requestContentStr.includes(nameTerm) ||
      resultStr.includes(nameTerm);

    // Apply date filter
    const dateCreated = fatwa.created_at ? new Date(fatwa.created_at) : null;
    const dateFromFilter = dateFrom ? new Date(dateFrom) : null;
    const dateToFilter = dateTo ? new Date(dateTo) : null;

    const dateMatches =
      (!dateFromFilter || (dateCreated && dateCreated >= dateFromFilter)) &&
      (!dateToFilter || (dateCreated && dateCreated <= dateToFilter));

    return matchesSearch && matchesName && dateMatches;
  });

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
              setCurrentStep(1);
              setShowModal(true);
            }}
          >
            <i className="ri-add-circle-line"></i> إضافة فتوى جديدة
          </button>
        )}
      </div>

      {(error || fatwasError) && (
        <div className="alert alert-danger">
          {error ||
            fatwasError?.data?.detail ||
            fatwasError?.error ||
            String(fatwasError)}
        </div>
      )}

      <div className="search-box">
        <input
          type="text"
          placeholder="بحث في الفتاوى..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="date-range-filter">
          <input
            type="date"
            placeholder="من التاريخ"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            placeholder="إلى التاريخ"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
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

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex align-items-center gap-2">
          <label className="form-label m-0">حجم الصفحة</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 90 }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            السابق
          </button>
          <span className="btn btn-sm btn-light disabled">
            صفحة {page} من {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            التالي
          </button>
        </div>
      </div>

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
              {/* Step indicator */}
              <div className="d-flex mb-3 justify-content-center">
                <span
                  className="badge bg-primary"
                  style={{ userSelect: "none" }}
                >
                  خطوه {currentStep}
                </span>
              </div>

              {/* Step 1: Request content */}
              {currentStep === 1 && (
                <div className="form-group">
                  <label>محتوى الطلب *</label>
                  <textarea
                    name="request_content"
                    value={formData.request_content}
                    onChange={handleChange}
                    rows="6"
                    required
                    className={fieldErrors.request_content ? "is-invalid" : ""}
                  ></textarea>
                  {fieldErrors.request_content && (
                    <div className="invalid-feedback d-block">
                      {fieldErrors.request_content}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Result (optional) */}
              {currentStep === 2 && (
                <div className="form-group">
                  <label>النتيجة</label>
                  <textarea
                    name="result"
                    value={formData.result}
                    onChange={handleChange}
                    rows="6"
                  ></textarea>
                </div>
              )}

              {/* Step 3: Department/File */}
              {currentStep === 3 && (
                <>
                  <div className="form-group">
                    <label>الإدارة *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className={fieldErrors.department ? "is-invalid" : ""}
                    >
                      <option value="">اختر الإدارة</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.department && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.department}
                      </div>
                    )}
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
                </>
              )}

              {(error || fatwasError) && (
                <div className="alert alert-danger">
                  {error || (fatwasError && String(fatwasError))}
                </div>
              )}

              <div className="modal-actions d-flex justify-content-between">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                    >
                      السابق
                    </button>
                  )}
                </div>
                <div>
                  {currentStep < 3 && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={submitting}
                      onClick={handleNext}
                    >
                      التالي
                    </button>
                  )}
                  {currentStep === 3 && (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        submitting ||
                        !(formData.request_content && formData.department)
                      }
                    >
                      {submitting
                        ? "جارٍ الحفظ..."
                        : editingFatwa
                        ? "تحديث"
                        : "إضافة"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-secondary ms-2"
                    onClick={() => setShowModal(false)}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fatwas;
