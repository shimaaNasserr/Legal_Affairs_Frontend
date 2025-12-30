import React, { useState, useContext, useMemo, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  useGetContractsQuery,
  useGetDepartmentsQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useDeleteContractMutation
} from "../../services/api";
import { useLocation } from "react-router-dom";
import "./Contracts.css";

const Contracts = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingContract, setEditingContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [sortBySoonest, setSortBySoonest] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    date_received: "",
    contract_number: "",
    contract_type: "",
    content: "",
    progress: "",
    archive_date: "",
    end_date: "",
    department: "",
    file: null,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const queryParams = useMemo(() => ({
    page,
    page_size: pageSize,
    ...(expiryFilter !== "all" ? { expiry: expiryFilter } : {}),
  }), [page, pageSize, expiryFilter]);

  const { data: contractsData, isLoading: loading, error: contractsError } = useGetContractsQuery(queryParams);
  const { data: departments = [] } = useGetDepartmentsQuery();

  const [createContract] = useCreateContractMutation();
  const [updateContract] = useUpdateContractMutation();
  const [deleteContract] = useDeleteContractMutation();

  const location = useLocation();

  const { data: expiredCountResp } = useGetContractsQuery({ expiry: "expired", page: 1, page_size: 1 });
  const { data: expiringCountResp } = useGetContractsQuery({ expiry: "expiring", page: 1, page_size: 1 });
  const expiredCount = typeof expiredCountResp === "object" ? (expiredCountResp?.count ?? 0) : 0;
  const expiringCount = typeof expiringCountResp === "object" ? (expiringCountResp?.count ?? 0) : 0;

  const contracts = contractsData?.results || contractsData || [];
  const totalCount = typeof contractsData === "object" && contractsData ? contractsData.count ?? contracts.length : contracts.length;
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

    const validStep1 = validateStep(1);
    const validStep2 = validateStep(2);
    const validStep3 = validateStep(3);
    if (!validStep1) { setCurrentStep(1); return; }
    if (!validStep2) { setCurrentStep(2); return; }
    if (!validStep3) { setCurrentStep(3); return; }

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

      if (editingContract) {
        await updateContract({
          id: editingContract.id,
          formData: submitData,
        }).unwrap();
      } else {
        await createContract(submitData).unwrap();
      }
      setShowModal(false);
      setEditingContract(null);
      resetForm();
    } catch (err) {
      console.error("Error saving contract:", err);
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
      setError(apiDetail || "فشل في حفظ العقد");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setFormData({
      date_received: contract.date_received || "",
      contract_number: contract.contract_number || "",
      contract_type: contract.contract_type || "",
      content: contract.content || "",
      progress: contract.progress || "",
      archive_date: contract.archive_date || "",
      end_date: contract.end_date || "",
      department: contract.department || "",
      file: null,
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleDelete = async (contractId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العقد؟")) return;

    try {
      await deleteContract(contractId).unwrap();
    } catch (err) {
      console.error("Error deleting contract:", err);
      setError("فشل في حذف العقد");
    }
  };

  const resetForm = () => {
    setFormData({
      date_received: "",
      contract_number: "",
      contract_type: "",
      content: "",
      progress: "",
      archive_date: "",
      end_date: "",
      department: "",
      file: null,
    });
    setFieldErrors({});
  };

  // Validate required fields for a specific step and set fieldErrors
  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.date_received) errs.date_received = "هذا الحقل مطلوب";
      if (!formData.contract_number) errs.contract_number = "هذا الحقل مطلوب";
      if (!formData.contract_type) errs.contract_type = "اختر نوع العقد";
    } else if (step === 2) {
      if (!formData.content) errs.content = "هذا الحقل مطلوب";
      if (!formData.progress) errs.progress = "هذا الحقل مطلوب";
    } else if (step === 3) {
      if (!formData.end_date) errs.end_date = "هذا الحقل مطلوب";
      if (!formData.department) errs.department = "هذا الحقل مطلوب";
    }
    setFieldErrors((prev) => ({ ...prev, ...errs }));
    return Object.keys(errs).length === 0;
  };

  const getTypeName = (type) => {
    const typeNames = {
      tender: "مناقصة",
      practice: "ممارسة",
      direct: "أمر مباشر",
      protocol: "بروتوكول إسناد",
    };
    return typeNames[type] || type;
  };

  const handleStepClick = (targetStep) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    const ok1 = targetStep >= 2 ? validateStep(1) : true;
    const ok2 = targetStep >= 3 ? validateStep(2) : true;
    if (ok1 && ok2) setCurrentStep(targetStep);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep(1)) setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (validateStep(2)) setCurrentStep(3);
      return;
    }
  };

  useEffect(() => {
    // On mount, restore saved view per user
    try {
      const userStr = localStorage.getItem('user');
      const uid = userStr ? (JSON.parse(userStr)?.id || 'anon') : 'anon';
      const savedView = localStorage.getItem(`contracts_view_${uid}`);
      if (savedView) {
        const v = JSON.parse(savedView);
        if (v.expiryFilter) setExpiryFilter(v.expiryFilter);
        if (v.typeFilter) setTypeFilter(v.typeFilter);
        if (typeof v.pageSize === 'number') setPageSize(v.pageSize);
        if (typeof v.sortBySoonest === 'boolean') setSortBySoonest(v.sortBySoonest);
        if (typeof v.searchTerm === 'string') setSearchTerm(v.searchTerm);
      } else {
        // fallback to previous single key
        const saved = localStorage.getItem("contracts_expiry_filter");
        if (saved === "expired" || saved === "expiring" || saved === "all") {
          setExpiryFilter(saved);
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    // Initialize/override from navigation state provided by notifications
    const f = location?.state?.filter;
    if (f === "expired" || f === "expiring") {
      setExpiryFilter(f);
      try {
        const userStr = localStorage.getItem('user');
        const uid = userStr ? (JSON.parse(userStr)?.id || 'anon') : 'anon';
        const v = JSON.parse(localStorage.getItem(`contracts_view_${uid}`) || '{}');
        v.expiryFilter = f;
        localStorage.setItem(`contracts_view_${uid}`, JSON.stringify(v));
      } catch { }
    }
  }, [location?.state]);

  useEffect(() => {
    // Reset to first page when expiry filter changes
    setPage(1);
    try {
      const userStr = localStorage.getItem('user');
      const uid = userStr ? (JSON.parse(userStr)?.id || 'anon') : 'anon';
      const v = JSON.parse(localStorage.getItem(`contracts_view_${uid}`) || '{}');
      v.expiryFilter = expiryFilter;
      localStorage.setItem(`contracts_view_${uid}`, JSON.stringify(v));
    } catch { }
  }, [expiryFilter]);

  // Persist other view settings
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const uid = userStr ? (JSON.parse(userStr)?.id || 'anon') : 'anon';
      const v = JSON.parse(localStorage.getItem(`contracts_view_${uid}`) || '{}');
      v.typeFilter = typeFilter;
      v.pageSize = pageSize;
      v.sortBySoonest = sortBySoonest;
      v.searchTerm = searchTerm;
      localStorage.setItem(`contracts_view_${uid}`, JSON.stringify(v));
    } catch { }
  }, [typeFilter, pageSize, sortBySoonest, searchTerm]);

  const isExpired = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const today = new Date();
    return end < today;
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const today = new Date();
    const in60 = new Date();
    in60.setDate(in60.getDate() + 60);
    return end >= today && end <= in60;
  };

  const isExpiringWithin7 = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const today = new Date();
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return end >= today && end <= in7;
  };

  // CSV export of current filtered/sorted view (fetch all pages server-side with same filters, then client filter search/type)
  const exportCsv = async () => {
    try {
      const params = { page: 1, page_size: 10000 };
      if (expiryFilter !== 'all') params.expiry = expiryFilter;
      if (typeFilter !== 'all') params.contract_type = typeFilter;
      const resp = await axiosInstance.get('contracts/', { params });
      const all = resp.data?.results || resp.data || [];
      // Apply client search filter like UI
      const filtered = all.filter((contract) => {
        const matchesSearch =
          (contract.contract_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contract.general_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (contract.content || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || contract.contract_type === typeFilter;
        return matchesSearch && matchesType;
      });
      // Sort if needed
      const rows = (expiryFilter !== 'all' || sortBySoonest)
        ? [...filtered].sort((a, b) => {
          const da = a.end_date ? new Date(a.end_date).getTime() : Number.MAX_SAFE_INTEGER;
          const db = b.end_date ? new Date(b.end_date).getTime() : Number.MAX_SAFE_INTEGER;
          return da - db;
        })
        : filtered;
      const headers = [
        'contract_number', 'general_number', 'contract_type', 'date_received', 'end_date', 'archive_date', 'department', 'content', 'progress'
      ];
      const escapeCsv = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      };
      const csv = [headers.join(',')].concat(rows.map(r => [
        r.contract_number,
        r.general_number,
        r.contract_type,
        r.date_received,
        r.end_date || '',
        r.archive_date || '',
        r.department || '',
        r.content || '',
        r.progress || ''
      ].map(escapeCsv).join(','))).join('\n');
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contracts_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed', e);
      alert('فشل تصدير CSV');
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const term = (searchTerm || "").toLowerCase();
    const contractNumberStr = String(contract.contract_number ?? "").toLowerCase();
    const generalNumberStr = String(contract.general_number ?? "").toLowerCase();
    const contentStr = String(contract.content ?? "").toLowerCase();
    const matchesSearch =
      contractNumberStr.includes(term) ||
      generalNumberStr.includes(term) ||
      contentStr.includes(term);

    const matchesType =
      typeFilter === "all" || contract.contract_type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Sort by nearest end date when viewing expiring/expired, or when toggle is on
  const sortedContracts = useMemo(() => {
    if (expiryFilter === 'all' && !sortBySoonest) return filteredContracts;
    const copy = [...filteredContracts];
    copy.sort((a, b) => {
      const da = a.end_date ? new Date(a.end_date).getTime() : Number.MAX_SAFE_INTEGER;
      const db = b.end_date ? new Date(b.end_date).getTime() : Number.MAX_SAFE_INTEGER;
      return da - db;
    });
    return copy;
  }, [filteredContracts, expiryFilter, sortBySoonest]);

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="contracts-page">
      <div className="page-header">
        <h2>إدارة العقود</h2>
        {(user?.role === "President" ||
          user?.role === "GeneralManager" ||
          user?.role === "DepartmentManager") && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingContract(null);
                  resetForm();
                  setCurrentStep(1);
                  setShowModal(true);
                }}
              >
                <i className="ri-add-circle-line"></i> إضافة عقد جديد
              </button>
              <button className="btn btn-outline-secondary" onClick={exportCsv}>
                <i className="ri-download-2-line"></i> تصدير CSV
              </button>
            </div>
          )}
      </div>

      {/* Segmented filter for expiry with counts */}
      <div className="btn-group mb-3" role="group" aria-label="expiry-segment">
        <button
          type="button"
          className={`btn btn-sm ${expiryFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setExpiryFilter('all')}
        >
          الكل
        </button>
        <button
          type="button"
          className={`btn btn-sm ${expiryFilter === 'expiring' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setExpiryFilter('expiring')}
          title="ستنتهي خلال شهرين"
        >
          ستنتهي قريباً ({expiringCount})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${expiryFilter === 'expired' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setExpiryFilter('expired')}
        >
          منتهية ({expiredCount})
        </button>
      </div>

      {/* Info banner when a filter is applied or sorting enabled */}
      {(expiryFilter !== 'all' || sortBySoonest) && (
        <div className="alert alert-info" role="alert">
          {expiryFilter === 'expired' ? 'تعرض العقود المنتهية فقط.' : expiryFilter === 'expiring' ? 'تعرض العقود التي ستنتهي خلال شهرين.' : 'تم تفعيل فرز الأقرب انتهاء.'}
        </div>
      )}

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
          <div className="form-check ms-3" title="عرض العقود المنتهية فقط">
            <input
              id="expiredOnly"
              className="form-check-input"
              type="checkbox"
              checked={expiryFilter === 'expired'}
              onChange={(e) => {
                setExpiryFilter(e.target.checked ? 'expired' : 'all');
                setPage(1);
              }}
            />
            <label className="form-check-label" htmlFor="expiredOnly">
              إظهار المنتهية فقط
            </label>
          </div>
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

      {(error || contractsError) && (
        <div className="alert alert-danger">
          {error || contractsError?.data?.detail || contractsError?.error || String(contractsError)}
        </div>
      )}

      <div className="filters">
        <div className="search-box">
          <i className="ri-search-line"></i>
          <input
            type="text"
            placeholder="بحث في العقود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">جميع الأنواع</option>
          <option value="tender">مناقصة</option>
          <option value="practice">ممارسة</option>
          <option value="direct">أمر مباشر</option>
          <option value="protocol">بروتوكول إسناد</option>
        </select>

        <select
          className="filter-select"
          value={expiryFilter}
          onChange={(e) => setExpiryFilter(e.target.value)}
        >
          <option value="all">كل الحالات</option>
          <option value="expiring">ستنتهي خلال شهرين</option>
          <option value="expired">العقود المنتهية</option>
        </select>

        <div className="form-check ms-2" title="فرز الأقرب انتهاء أولاً">
          <input
            id="sortSoonest"
            className="form-check-input"
            type="checkbox"
            checked={sortBySoonest}
            onChange={(e) => setSortBySoonest(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="sortSoonest">
            الأقرب انتهاء أولاً
          </label>
        </div>
      </div>

      <div className="contracts-grid">
        {sortedContracts.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد عقود</p>
          </div>
        ) : (
          sortedContracts.map((contract) => {
            const expired = isExpired(contract.end_date);
            const expiring = !expired && isExpiringSoon(contract.end_date);
            const urgent = !expired && isExpiringWithin7(contract.end_date);
            return (
              <div key={contract.id} className={`contract-card ${expired ? 'expired' : expiring ? 'expiring' : ''} ${urgent ? 'urgent' : ''}`}>
                <div className="card-header">
                  <h3>عقد رقم {contract.contract_number}</h3>
                  <div className="badges-right">
                    {expired && <span className="status-badge expired">منتهي</span>}
                    {urgent && <span className="status-badge urgent">ينتهي خلال 7 أيام</span>}
                    {!urgent && expiring && <span className="status-badge expiring">ينتهي قريباً</span>}
                    <span className="type-badge">{getTypeName(contract.contract_type)}</span>
                  </div>
                </div>
                <p className="description">{contract.content}</p>
                <div className="card-details">
                  <div className="detail-item">
                    <i className="ri-hashtag"></i>
                    <span>الرقم العام: {contract.general_number || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <i className="ri-calendar-check-line"></i>
                    <span>
                      تاريخ الاستلام:{" "}
                      {contract.date_received
                        ? new Date(contract.date_received).toLocaleDateString("ar")
                        : "-"}
                    </span>
                  </div>
                  {contract.end_date && (
                    <div className="detail-item">
                      <i className="ri-calendar-close-line"></i>
                      <span>
                        تاريخ الانتهاء:{" "}
                        {new Date(contract.end_date).toLocaleDateString("ar")}
                      </span>
                    </div>
                  )}
                  {contract.archive_date && (
                    <div className="detail-item">
                      <i className="ri-archive-line"></i>
                      <span>
                        تاريخ الحفظ:{" "}
                        {new Date(contract.archive_date).toLocaleDateString("ar")}
                      </span>
                    </div>
                  )}
                  {contract.file && (
                    <a
                      href={contract.file}
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
                        onClick={() => handleEdit(contract)}
                      >
                        <i className="ri-pencil-line"></i> تعديل
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDelete(contract.id)}
                      >
                        <i className="ri-delete-bin-line"></i> حذف
                      </button>
                    </div>
                  )}
              </div>
            )
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingContract ? "تعديل عقد" : "إضافة عقد جديد"}</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="contract-form">
              {/* Step indicator */}
              <div className="d-flex mb-3 justify-content-center">
                <span className="badge bg-primary" style={{ userSelect: 'none' }}>
                  خطوه {currentStep}
                </span>
              </div>

              {/* Step 1: Basic info */}
              {currentStep === 1 && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>تاريخ ورود العقد *</label>
                      <input
                        type="date"
                        name="date_received"
                        value={formData.date_received}
                        onChange={handleChange}
                        required
                        className={fieldErrors.date_received ? "is-invalid" : ""}
                      />
                      {fieldErrors.date_received && (
                        <div className="invalid-feedback d-block">{fieldErrors.date_received}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>رقم حصر العقود *</label>
                      <input
                        type="text"
                        name="contract_number"
                        value={formData.contract_number}
                        onChange={handleChange}
                        required
                        className={fieldErrors.contract_number ? "is-invalid" : ""}
                      />
                      {fieldErrors.contract_number && (
                        <div className="invalid-feedback d-block">{fieldErrors.contract_number}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>نوع العقد *</label>
                    <select
                      name="contract_type"
                      value={formData.contract_type}
                      onChange={handleChange}
                      required
                      className={fieldErrors.contract_type ? "is-invalid" : ""}
                    >
                      <option value="">اختر النوع</option>
                      <option value="tender">مناقصة</option>
                      <option value="practice">ممارسة</option>
                      <option value="direct">أمر مباشر</option>
                      <option value="protocol">بروتوكول إسناد</option>
                    </select>
                    {fieldErrors.contract_type && (
                      <div className="invalid-feedback d-block">{fieldErrors.contract_type}</div>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Content & Progress */}
              {currentStep === 2 && (
                <>
                  <div className="form-group">
                    <label>مضمون العقد *</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows="4"
                      required
                      className={fieldErrors.content ? "is-invalid" : ""}
                    ></textarea>
                    {fieldErrors.content && (
                      <div className="invalid-feedback d-block">{fieldErrors.content}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>ما تم في العقد *</label>
                    <textarea
                      name="progress"
                      value={formData.progress}
                      onChange={handleChange}
                      rows="4"
                      required
                      className={fieldErrors.progress ? "is-invalid" : ""}
                    ></textarea>
                    {fieldErrors.progress && (
                      <div className="invalid-feedback d-block">{fieldErrors.progress}</div>
                    )}
                  </div>
                </>
              )}

              {/* Step 3: Dates / Optional fields */}
              {currentStep === 3 && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>تاريخ الحفظ</label>
                      <input
                        type="date"
                        name="archive_date"
                        value={formData.archive_date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>تاريخ الانتهاء</label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                        className={fieldErrors.end_date ? "is-invalid" : ""}
                      />
                      {fieldErrors.end_date && (
                        <div className="invalid-feedback d-block">{fieldErrors.end_date}</div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>الإدارة</label>
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
                      <div className="invalid-feedback d-block">{fieldErrors.department}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>رفع ملف العقد (PDF)</label>
                    <input
                      type="file"
                      name="file"
                      accept=".pdf"
                      onChange={handleChange}
                      className={fieldErrors.file ? "is-invalid" : ""}
                    />
                    {fieldErrors.file && (
                      <div className="invalid-feedback d-block">{fieldErrors.file}</div>
                    )}
                  </div>
                </>
              )}

              {(error || contractsError) && (
                <div className="alert alert-danger">
                  {error || (contractsError && String(contractsError))}
                </div>
              )}

              {/* Step controls */}
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
                        !(formData.date_received && formData.contract_number && formData.contract_type && formData.content && formData.progress && formData.end_date && formData.department)
                      }
                    >
                      {submitting ? "جارٍ الحفظ..." : (editingContract ? "تحديث" : "إضافة")}
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

export default Contracts;
