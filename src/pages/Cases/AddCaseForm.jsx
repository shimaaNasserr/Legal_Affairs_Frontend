import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import "./Cases.css";

const CASE_STATUS_CHOICES = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "under_study", label: "قيد الدراسة" },
  { value: "in_court", label: "قيد التقاضي" },
  { value: "closed", label: "منتهية" },
  { value: "appealed", label: "قيد الاستئناف" },
];

const RULING_CHOICES = [
  { value: "for_university", label: "لصالح الجامعة" },
  { value: "against_university", label: "ضد الجامعة" },
];

export default function AddCaseForm({ refetchCases }) {
  const {
    courtId: paramCourtId,
    courtName: paramCourtName,
    id: editId,
  } = useParams();
  const [searchParams] = useSearchParams();
  const divisionNameParam = searchParams.get("divisionName");

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date_received: "",
    case_number: "",
    general_number: "",
    lawsuit_number: "",
    plaintiff: "",
    defendant: "",
    requests: "",
    hearing_dates: [""],
    ruling: "",
    appeal_status: null,
    case_status: "",
    saved_date: "",
    notes: "",
    file: null,
  });
  const [fieldErrors, setFieldErrors] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [courtDisplay, setCourtDisplay] = useState(paramCourtName || "");
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (editId) {
      setIsEdit(true);
      fetchCase(editId);
    } else if (paramCourtName) {
      setCourtDisplay(
        divisionNameParam
          ? `${paramCourtName} - ${divisionNameParam}`
          : paramCourtName
      );
    }
  }, [editId]);

  const fetchCase = async (id) => {
    try {
      setFetchingData(true);
      const res = await axiosInstance.get(`/cases/${id}/`);
      const data = res.data;

      setFormData({
        date_received: data.date_received || "",
        case_number: data.case_number || "",
        general_number: data.general_number || "",
        lawsuit_number: data.lawsuit_number || "",
        plaintiff: data.plaintiff || "",
        defendant: data.defendant || "",
        requests: data.requests || "",
        hearing_dates: data.hearing_dates.length ? data.hearing_dates : [""],
        ruling: data.ruling || "",
        appeal_status: data.appeal_status ?? null,
        case_status: data.case_status || "",
        saved_date: data.saved_date || "",
        notes: data.notes || "",
        file: null,
      });

      setCourtDisplay(
        data.division_name
          ? `${data.court_name} - ${data.division_name}`
          : data.court_name
      );
    } catch (err) {
      alert("فشل تحميل بيانات القضية");
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e, index = null) => {
    const { name, value, files } = e.target;
    if (name === "hearing_dates" && index !== null) {
      const updated = [...formData.hearing_dates];
      updated[index] = value;
      setFormData({ ...formData, hearing_dates: updated });
    } else if (name === "appeal_status") {
      setFormData({
        ...formData,
        [name]: value === "true" ? true : value === "false" ? false : null,
      });
    } else {
      // Reset appeal_status when ruling changes to something other than 'against_university'
      if (name === "ruling" && value !== "against_university") {
        setFormData({ ...formData, [name]: value, appeal_status: null });
      } else {
        setFormData({ ...formData, [name]: files ? files[0] : value });
      }
    }
  };

  const addHearingDate = () =>
    setFormData({
      ...formData,
      hearing_dates: [...formData.hearing_dates, ""],
    });
  const removeHearingDate = (index) => {
    const updated = [...formData.hearing_dates];
    updated.splice(index, 1);
    setFormData({
      ...formData,
      hearing_dates: updated.length ? updated : [""],
    });
  };

  const validateForm = () => {
    const newFieldErrors = [];
    const newErrors = [];

    if (!formData.date_received) {
      newFieldErrors.push("date_received");
      newErrors.push("تاريخ ورود الدعوى مطلوب");
    }
    if (!formData.case_number) {
      newFieldErrors.push("case_number");
      newErrors.push("رقم الحصر مطلوب");
    }
    if (!formData.lawsuit_number) {
      newFieldErrors.push("lawsuit_number");
      newErrors.push("رقم الدعوى مطلوب");
    }
    if (!formData.plaintiff) {
      newFieldErrors.push("plaintiff");
      newErrors.push("اسم المدعي مطلوب");
    }
    if (!formData.defendant) {
      newFieldErrors.push("defendant");
      newErrors.push("اسم المدعى عليه مطلوب");
    }
    if (!formData.requests) {
      newFieldErrors.push("requests");
      newErrors.push("الطلبات مطلوبة");
    }
    if (!formData.case_status) {
      newFieldErrors.push("case_status");
      newErrors.push("حالة القضية مطلوبة");
    }

    setFieldErrors(newFieldErrors);
    setErrors(newErrors);

    return newErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formToSend = new FormData();
    const validHearingDates = formData.hearing_dates.filter((d) => d);
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        if (key === "hearing_dates")
          formToSend.append(key, JSON.stringify(validHearingDates));
        else formToSend.append(key, value);
      }
    });

    if (!isEdit && paramCourtId) formToSend.append("court", paramCourtId);

    try {
      setLoading(true);
      if (isEdit) await axiosInstance.patch(`/cases/${editId}/`, formToSend);
      else await axiosInstance.post(`/cases/`, formToSend);

      if (refetchCases) await refetchCases();
      navigate("/cases");
    } catch (err) {
      const backendErrors = [];
      if (err.response?.data) {
        for (let key in err.response.data) {
          const msg = err.response.data[key];
          backendErrors.push(msg?.join ? msg.join(", ") : msg);
        }
      } else backendErrors.push("حدث خطأ أثناء الحفظ");
      setErrors(backendErrors);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) return <div>جاري تحميل بيانات القضية...</div>;

  return (
    <div className="add-case-page">
      <h2>
        {isEdit ? "تعديل قضية" : "إضافة قضية"} - {courtDisplay}
      </h2>
      <form onSubmit={handleSubmit} className="case-form">
        <label>تاريخ ورود الدعوى *</label>
        <input
          type="date"
          name="date_received"
          value={formData.date_received}
          onChange={handleChange}
          className={fieldErrors.includes("date_received") ? "error-field" : ""}
        />

        <label>
          رقم الحصر العام
          <span className="note">
            {" "}
            (سيتم توليده تلقائياً إذا لم يتم إدخاله)
          </span>
        </label>
        <input
          type="text"
          name="general_number"
          value={formData.general_number}
          onChange={handleChange}
        />

        <label>رقم حصر القضايا *</label>
        <input
          type="text"
          name="case_number"
          value={formData.case_number}
          onChange={handleChange}
          className={fieldErrors.includes("case_number") ? "error-field" : ""}
        />

        <label>رقم الدعوى والسنة القضائية *</label>
        <input
          type="text"
          name="lawsuit_number"
          value={formData.lawsuit_number}
          onChange={handleChange}
          className={
            fieldErrors.includes("lawsuit_number") ? "error-field" : ""
          }
        />

        <label>المحكمة</label>
        <input
          type="text"
          disabled
          value={courtDisplay}
          style={{ background: "#eee", color: "#777" }}
        />

        <label>اسم المدعي *</label>
        <input
          type="text"
          name="plaintiff"
          value={formData.plaintiff}
          onChange={handleChange}
          className={fieldErrors.includes("plaintiff") ? "error-field" : ""}
        />

        <label>اسم المدعى عليه *</label>
        <input
          type="text"
          name="defendant"
          value={formData.defendant}
          onChange={handleChange}
          className={fieldErrors.includes("defendant") ? "error-field" : ""}
        />

        <label>الطلبات *</label>
        <textarea
          name="requests"
          value={formData.requests}
          onChange={handleChange}
          className={fieldErrors.includes("requests") ? "error-field" : ""}
        />

        <label>تاريخ الجلسات</label>
        {formData.hearing_dates.map((date, idx) => (
          <div key={idx} className="hearing-date-group">
            <input
              type="date"
              name="hearing_dates"
              value={date}
              onChange={(e) => handleChange(e, idx)}
              style={{ marginBottom: "0" }}
            />
            <button
              type="button"
              className="btn btn-sm btn-remove"
              onClick={() => removeHearingDate(idx)}
            >
              حذف
            </button>
            {idx === formData.hearing_dates.length - 1 && (
              <button
                type="button"
                className="btn btn-sm btn-add"
                onClick={addHearingDate}
              >
                +
              </button>
            )}
          </div>
        ))}

        <label>الحكم الصادر</label>
        <select name="ruling" value={formData.ruling} onChange={handleChange}>
          <option value="">اختيار...</option>
          {RULING_CHOICES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {formData.ruling === "against_university" && (
          <div className="appeal-status-group">
            <label>موقف الدعوى من الطعن</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="appeal_status"
                  checked={formData.appeal_status === true}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, appeal_status: true }))
                  }
                />
                <span>تم الطعن</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="appeal_status"
                  checked={formData.appeal_status === false}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, appeal_status: false }))
                  }
                />
                <span>لم يتم الطعن</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="appeal_status"
                  checked={formData.appeal_status === null}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, appeal_status: null }))
                  }
                />
                <span>غير محدد</span>
              </label>
            </div>
          </div>
        )}

        <label>حالة القضية *</label>
        <select
          name="case_status"
          value={formData.case_status}
          onChange={handleChange}
          className={fieldErrors.includes("case_status") ? "error-field" : ""}
        >
          <option value="">اختيار...</option>
          {CASE_STATUS_CHOICES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <label>تاريخ الحفظ</label>
        <input
          type="date"
          name="saved_date"
          value={formData.saved_date}
          onChange={handleChange}
        />

        <label>ملاحظات الدعوى</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        ></textarea>

        <label>ملف الدعوى</label>
        <input
          type="file"
          name="file"
          accept=".pdf, .doc, .docx, application/pdf, application/msword"
          onChange={handleChange}
        />

        <div className="form-actions-left">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? "جاري الحفظ..."
              : isEdit
              ? "حفظ التعديلات"
              : "حفظ القضية"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/cases")}
          >
            إلغاء
          </button>
        </div>

        {errors.length > 0 && (
          <div className="error-log">
            <ul>
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}
