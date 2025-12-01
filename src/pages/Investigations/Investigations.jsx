import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import {
  useGetInvestigationsQuery,
  useGetInvestigationByIdQuery,
  useCreateInvestigationMutation,
  useUpdateInvestigationMutation,
  useDeleteInvestigationMutation,
} from "../../services/api";
import "./Investigations.css";

const Investigations = () => {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
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

  // Normalize backend errors (including field-level validation) into a readable form
  const extractErrorMessages = (err) => {
    const data = err?.data || err?.response?.data || err;
    if (!data) return "حدث خطأ غير متوقع";

    if (typeof data === "string") return data;

    const fieldLabels = {
      title: "عنوان التحقيق",
      description: "وصف التحقيق",
      accused_names: "أسماء المتهمين",
      date_received: "تاريخ الاستلام",
      date_started: "تاريخ البداية",
      date_completed: "تاريخ الانتهاء",
      status: "الحالة",
      priority: "الأولوية",
      case_type: "نوع القضية",
      complainant_type: "نوع المشتكي",
      complainant_name: "اسم المشتكي",
      complainant_id: "رقم هوية المشتكي",
      faculty_college: "الكلية/الجهة",
      notes: "الملاحظات",
      findings: "النتائج",
      recommendations: "التوصيات",
      department: "الإدارة",
      assigned_investigators: "المحققون",
      file: "ملف التحقيق",
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

  // Use cached query - data is automatically cached and reused
  const {
    data: investigations = [],
    isLoading: loading,
    error: queryError,
  } = useGetInvestigationsQuery();

  // Fetch full investigation details when editing
  const { data: fullInvestigationData, isLoading: loadingFullData } =
    useGetInvestigationByIdQuery(editingInvestigation?.id, {
      skip: !editingInvestigation?.id, // Skip if not editing
    });

  const [createInvestigation, { isLoading: isCreating }] =
    useCreateInvestigationMutation();
  const [updateInvestigation, { isLoading: isUpdating }] =
    useUpdateInvestigationMutation();
  const [deleteInvestigation] = useDeleteInvestigationMutation();

  // Combined loading state for form operations
  const isFormLoading = loadingFullData || isCreating || isUpdating;

  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Try to parse various date formats
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (err) {
      console.warn("Error formatting date:", dateString, err);
      return "";
    }
  };

  // Helper function to parse accused_names_list from malformed backend format
  const parseAccusedNamesList = (accusedNamesList) => {
    if (!accusedNamesList) return [];
    if (!Array.isArray(accusedNamesList)) return [];
    if (accusedNamesList.length === 0) return [];

    const firstItem = accusedNamesList[0];
    const lastItem = accusedNamesList[accusedNamesList.length - 1];

    if (
      typeof firstItem === "string" &&
      typeof lastItem === "string" &&
      (firstItem.startsWith("['") || firstItem.startsWith('["')) &&
      (lastItem.endsWith("']") || lastItem.endsWith('"]'))
    ) {
      const allNames = accusedNamesList
        .map((item, index) => {
          if (typeof item !== "string") return null;
          let cleaned = item;
          if (index === 0) {
            cleaned = cleaned.replace(/^\[['"]/, "");
          }
          if (index === accusedNamesList.length - 1) {
            cleaned = cleaned.replace(/['"]\]$/, "");
          }
          cleaned = cleaned.replace(/^['"]|['"]$/g, "");
          return cleaned.trim();
        })
        .filter((name) => name && name.length > 0);
      return allNames;
    }

    if (
      typeof firstItem === "string" &&
      firstItem.startsWith("[") &&
      firstItem.endsWith("]") &&
      accusedNamesList.length === 1
    ) {
      try {
        const cleaned = firstItem.replace(/^\[|\]$/g, "").replace(/['"]/g, "");
        const names = cleaned
          .split(",")
          .map((name) => name.trim())
          .filter((name) => name);
        return names;
      } catch (err) {
        console.warn("Error parsing accused_names_list:", err);
      }
    }

    return accusedNamesList.filter(
      (item) => item && typeof item === "string" && item.trim().length > 0
    );
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Effect to populate form when full investigation data is loaded
  useEffect(() => {
    if (fullInvestigationData && editingInvestigation) {
      const investigation = fullInvestigationData; // Use full data from API

      // Parse accused_names_list if available, otherwise use accused_names
      let accusedNames = [];

      if (investigation.accused_names_list) {
        accusedNames = parseAccusedNamesList(investigation.accused_names_list);
      } else if (investigation.accused_names) {
        if (typeof investigation.accused_names === "string") {
          accusedNames = investigation.accused_names
            .split(/[,،]/)
            .map((name) => name.trim())
            .filter((name) => name);
        } else if (Array.isArray(investigation.accused_names)) {
          accusedNames = investigation.accused_names;
        }
      }

      const accusedNamesInput =
        Array.isArray(accusedNames) && accusedNames.length > 0
          ? accusedNames.join(", ")
          : "";

      const description = investigation.description ?? investigation.desc ?? "";

      const newFormData = {
        title: investigation.title ?? "",
        description: String(description),
        accused_names_input: accusedNamesInput,
        date_received: formatDateForInput(investigation.date_received),
        date_started: formatDateForInput(investigation.date_started),
        date_completed: formatDateForInput(investigation.date_completed),
        status: investigation.status ?? "pending",
        priority: investigation.priority ?? "medium",
        case_type: investigation.case_type ?? "internal_disciplinary",
        complainant_type: investigation.complainant_type ?? "",
        complainant_name: investigation.complainant_name ?? "",
        complainant_id: investigation.complainant_id ?? "",
        faculty_college: investigation.faculty_college ?? "",
        notes: investigation.notes ?? "",
        findings: investigation.findings ?? "",
        recommendations: investigation.recommendations ?? "",
        department:
          investigation.department == null
            ? ""
            : typeof investigation.department === "object"
            ? investigation.department?.id ?? ""
            : String(investigation.department),
        assigned_investigators:
          investigation.assigned_investigators_details?.map((i) => i.id) ??
          investigation.assigned_investigators ??
          [],
        file: null,
      };

      console.log("Editing investigation - Full API data:", {
        description: investigation.description,
        accused_names_list: investigation.accused_names_list,
        accused_names: investigation.accused_names,
      });
      console.log("Editing investigation - Parsed form data:", {
        description: newFormData.description,
        accused_names_input: newFormData.accused_names_input,
      });

      setFormData(newFormData);
    }
  }, [fullInvestigationData, editingInvestigation]);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("departments/");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
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
          submitData.append("accused_names", names.join(","));
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
        await updateInvestigation({
          id: editingInvestigation.id,
          formData: submitData,
        }).unwrap();
      } else {
        await createInvestigation(submitData).unwrap();
      }
      setShowModal(false);
      setEditingInvestigation(null);
      resetForm();
      // Cache is automatically invalidated and refetched by RTK Query
    } catch (err) {
      console.error("Error saving investigation:", err);
      setError(extractErrorMessages(err) || "فشل في حفظ التحقيق");
    }
  };

  const handleEdit = (investigation) => {
    setEditingInvestigation(investigation);
    setShowModal(true);
    // Form will be populated by useEffect when fullInvestigationData loads
  };

  const handleDelete = async (investigationId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التحقيق؟")) return;

    try {
      await deleteInvestigation(investigationId).unwrap();
      // Cache is automatically invalidated and refetched by RTK Query
    } catch (err) {
      console.error("Error deleting investigation:", err);
      setError(extractErrorMessages(err) || "فشل في حذف التحقيق");
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

      {(error || queryError) && (
        <div className="alert alert-danger">
          {Array.isArray(error) ? (
            <ul className="mb-0">
              {error.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          ) : (
            error ||
            (queryError && extractErrorMessages(queryError)) ||
            "فشل في تحميل التحقيقات"
          )}
        </div>
      )}

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
                {(() => {
                  const parsedNames = parseAccusedNamesList(
                    investigation.accused_names_list
                  );
                  return parsedNames.length > 0 ? (
                    <span>
                      <i className="ri-team-line"></i> المتهمون:{" "}
                      {parsedNames.join(", ")}
                    </span>
                  ) : null;
                })()}
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
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
                disabled={isFormLoading}
              >
                ×
              </button>
            </div>
            {loadingFullData && (
              <div className="form-loading-overlay">
                <div className="loading-spinner">
                  <i className="ri-loader-4-line"></i>
                  <p>جاري تحميل البيانات...</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="investigation-form">
              <div className="form-group">
                <label>عنوان التحقيق *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isFormLoading}
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
                  disabled={isFormLoading}
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
                    disabled={isFormLoading}
                  />
                </div>

                <div className="form-group">
                  <label>الحالة *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    disabled={isFormLoading}
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
                    disabled={isFormLoading}
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
                    disabled={isFormLoading}
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
                  disabled={isFormLoading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>نوع المشتكي</label>
                  <select
                    name="complainant_type"
                    value={formData.complainant_type}
                    onChange={handleChange}
                    disabled={isFormLoading}
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
                    disabled={isFormLoading}
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
                    disabled={isFormLoading}
                  />
                </div>

                <div className="form-group">
                  <label>الكلية المعنية</label>
                  <input
                    type="text"
                    name="faculty_college"
                    value={formData.faculty_college}
                    onChange={handleChange}
                    disabled={isFormLoading}
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
                    disabled={isFormLoading}
                  />
                </div>

                <div className="form-group">
                  <label>تاريخ انتهاء التحقيق</label>
                  <input
                    type="date"
                    name="date_completed"
                    value={formData.date_completed}
                    onChange={handleChange}
                    disabled={isFormLoading}
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
                  disabled={isFormLoading}
                ></textarea>
              </div>

              <div className="form-group">
                <label>النتائج</label>
                <textarea
                  name="findings"
                  value={formData.findings}
                  onChange={handleChange}
                  rows="3"
                  disabled={isFormLoading}
                ></textarea>
              </div>

              <div className="form-group">
                <label>التوصيات</label>
                <textarea
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleChange}
                  rows="3"
                  disabled={isFormLoading}
                ></textarea>
              </div>

              <div className="form-group">
                <label>الإدارة</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={isFormLoading}
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
                  disabled={isFormLoading}
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
                  disabled={isFormLoading}
                >
                  {isFormLoading ? (
                    <>
                      <i className="ri-loader-4-line"></i>{" "}
                      {isCreating || isUpdating
                        ? editingInvestigation
                          ? "جاري التحديث..."
                          : "جاري الإضافة..."
                        : "جاري التحميل..."}
                    </>
                  ) : editingInvestigation ? (
                    "تحديث"
                  ) : (
                    "إضافة"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={isFormLoading}
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
