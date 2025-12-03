import React, { useState, useContext, useMemo, useEffect } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import { useGetContractsQuery, useGetDepartmentsQuery } from "../../services/api";
import { useLocation } from "react-router-dom";
import "./Contracts.css";

const Contracts = () => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all"); // all | expired | expiring
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

  // Use cached queries - data is automatically cached and reused
  const queryParams = useMemo(() => ({
    page,
    page_size: pageSize,
    ...(expiryFilter !== "all" ? { expiry: expiryFilter } : {}),
  }), [page, pageSize, expiryFilter]);

  const { data: contractsData, isLoading: loading, error: contractsError } = useGetContractsQuery(queryParams);
  const { data: departments = [] } = useGetDepartmentsQuery();
  const location = useLocation();
  
  const contracts = contractsData?.results || contractsData || [];
  const totalCount = typeof contractsData === "object" && contractsData ? contractsData.count ?? contracts.length : contracts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

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

      if (editingContract) {
        await axiosInstance.put(
          `contracts/${editingContract.id}/`,
          submitData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        await axiosInstance.post("contracts/", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      setEditingContract(null);
      resetForm();
      // Cache will be invalidated by RTK Query if we add mutations
      window.location.reload(); // Temporary: reload to refresh cache
    } catch (err) {
      console.error("Error saving contract:", err);
      setError(err.response?.data?.message || "فشل في حفظ العقد");
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
    setShowModal(true);
  };

  const handleDelete = async (contractId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العقد؟")) return;

    try {
      await axiosInstance.delete(`contracts/${contractId}/`);
      // Cache will be invalidated by RTK Query if we add mutations
      window.location.reload(); // Temporary: reload to refresh cache
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

  useEffect(() => {
    // Initialize expiry filter if navigation state provided from notifications
    const f = location?.state?.filter;
    if (f === "expired" || f === "expiring") {
      setExpiryFilter(f);
    }
  }, [location?.state]);

  useEffect(() => {
    // Reset to first page when expiry filter changes
    setPage(1);
  }, [expiryFilter]);

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

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.general_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.content?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      typeFilter === "all" || contract.contract_type === typeFilter;

    return matchesSearch && matchesType;
  });

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
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingContract(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <i className="ri-add-circle-line"></i> إضافة عقد جديد
          </button>
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
      </div>

      <div className="contracts-grid">
        {filteredContracts.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد عقود</p>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const expired = isExpired(contract.end_date);
            const expiring = !expired && isExpiringSoon(contract.end_date);
            return (
            <div key={contract.id} className={`contract-card ${expired ? 'expired' : expiring ? 'expiring' : ''}`}>
              <div className="card-header">
                <h3>عقد رقم {contract.contract_number}</h3>
                <div className="badges-right">
                  {expired && <span className="status-badge expired">منتهي</span>}
                  {expiring && <span className="status-badge expiring">ينتهي قريباً</span>}
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
          )})
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
              <div className="form-row">
                <div className="form-group">
                  <label>تاريخ ورود العقد *</label>
                  <input
                    type="date"
                    name="date_received"
                    value={formData.date_received}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>رقم حصر العقود *</label>
                  <input
                    type="text"
                    name="contract_number"
                    value={formData.contract_number}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>نوع العقد *</label>
                <select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">اختر النوع</option>
                  <option value="tender">مناقصة</option>
                  <option value="practice">ممارسة</option>
                  <option value="direct">أمر مباشر</option>
                  <option value="protocol">بروتوكول إسناد</option>
                </select>
              </div>

              <div className="form-group">
                <label>مضمون العقد *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>ما تم في العقد *</label>
                <textarea
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  rows="4"
                  required
                ></textarea>
              </div>

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
                  />
                </div>
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
                <label>رفع ملف العقد (PDF)</label>
                <input
                  type="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleChange}
                />
              </div>

              {(error || contractsError) && (
        <div className="alert alert-danger">
          {error || (contractsError && String(contractsError))}
        </div>
      )}

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingContract ? "تحديث" : "إضافة"}
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

export default Contracts;
