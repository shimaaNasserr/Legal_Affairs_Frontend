import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import "./Cases.css";

const CASE_STATUS_CHOICES = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "under_study", label: "قيد الدراسة" },
  { value: "in_court", label: "قيد التقاضي" },
  { value: "closed", label: "منتهية" },
  { value: "appealed", label: "قيد الاستئناف" },
];

export default function AddCaseForm() {
  const { courtId, courtName, id } = useParams(); // id هنا هو caseId عند التعديل
  const navigate = useNavigate();
  const location = useLocation();

  // استخدمنا state من navigate لو موجود
  const caseIdFromState = location.state?.caseId;
  const caseId = id || caseIdFromState; // هنا نحسم أي حالة

  const query = new URLSearchParams(location.search);
  const divisionNameFromQuery = query.get("divisionName");

  const [realCourtName, setRealCourtName] = useState(courtName || "");
  const [realDivisionName, setRealDivisionName] = useState(divisionNameFromQuery || "");

  const isEdit = Boolean(caseId);

  const [formData, setFormData] = useState({
    date_received: "",
    case_number: "",
    general_number: "",
    lawsuit_number: "",
    plaintiff: "",
    defendant: "",
    requests: "",
    hearing_dates: "",
    ruling: "",
    appeal_status: "",
    case_status: "",
    saved_date: "",
    notes: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // ==============================
  // جلب بيانات القضية عند التعديل
  // ==============================
  useEffect(() => {
    if (!isEdit) {
      setInitialLoading(false);
      return;
    }

    const fetchCase = async () => {
      try {
        const res = await axiosInstance.get(`/cases/${caseId}/`);
        const data = res.data;

        setFormData({
          date_received: data.date_received || "",
          case_number: data.case_number || "",
          general_number: data.general_number || "",
          lawsuit_number: data.lawsuit_number || "",
          plaintiff: data.plaintiff || "",
          defendant: data.defendant || "",
          requests: data.requests || "",
          hearing_dates: data.hearing_dates || "",
          ruling: data.ruling || "",
          appeal_status: data.appeal_status?.toString() || "",
          case_status: data.case_status || "",
          saved_date: data.saved_date || "",
          notes: data.notes || "",
          file: null,
        });

        setRealCourtName(data.court_name);
        setRealDivisionName(data.division_name || "");
      } catch (err) {
        console.error(err);
        alert("فشل تحميل بيانات القضية");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCase();
  }, [caseId, isEdit]);

  // ==============================
  // Handle Change
  // ==============================
  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  // ==============================
  // Handle Submit
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formToSend.append(key, value);
      }
    });

    if (!isEdit) {
      formToSend.append("court", courtId);
      if (divisionNameFromQuery) formToSend.append("division_name", divisionNameFromQuery);
    }

    try {
      setLoading(true);
      if (isEdit) {
        await axiosInstance.patch(`/cases/${caseId}/`, formToSend);
      } else {
        await axiosInstance.post(`/cases/`, formToSend);
      }
      navigate("/cases");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <p>جاري تحميل البيانات...</p>;

  return (
    <div className="add-case-container">
      <h2>{isEdit ? "تعديل قضية" : "إضافة قضية"} - {realCourtName}</h2>

      <form onSubmit={handleSubmit} className="case-form">
        <label>تاريخ ورود الدعوى</label>
        <input type="date" name="date_received" value={formData.date_received} onChange={handleChange} required />

        <label>رقم الحصر العام</label>
        <input type="text" name="general_number" value={formData.general_number} onChange={handleChange} required />

        <label>رقم حصر القضايا</label>
        <input type="text" name="case_number" value={formData.case_number} onChange={handleChange} required />

        <label>رقم الدعوى والسنة القضائية</label>
        <input type="text" name="lawsuit_number" value={formData.lawsuit_number} onChange={handleChange} required />

        <label>المحكمة المرفوع أمامها الدعوى</label>
        <input type="text" disabled value={realDivisionName ? `${realCourtName} - ${realDivisionName}` : realCourtName} style={{ background: "#eee", color: "#777" }} />

        <label>اسم المدعي</label>
        <input type="text" name="plaintiff" value={formData.plaintiff} onChange={handleChange} required />

        <label>اسم المدعى عليه</label>
        <input type="text" name="defendant" value={formData.defendant} onChange={handleChange} required />

        <label>الطلبات</label>
        <textarea name="requests" value={formData.requests} onChange={handleChange}></textarea>

        <label>تاريخ الجلسات</label>
        <input type="date" name="hearing_dates" value={formData.hearing_dates} onChange={handleChange} />

        <label class="group-title">الحكم الصادر ف الدعوى</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="ruling"
              value="for_university"
              checked={formData.ruling === "for_university"}
              onChange={(e) => setFormData({ ...formData, ruling: e.target.value })}
            />
            <span>لصالح الجامعة</span>
          </label>

          <label>
            <input
              type="radio"
              name="ruling"
              value="against_university"
              checked={formData.ruling === "against_university"}
              onChange={(e) => setFormData({ ...formData, ruling: e.target.value })}
            />
            <span>ضد الجامعة</span>
          </label>
        </div>

        {/* موقف الدعوى من الطعن */}
        <label>موقف الدعوى من الطعن</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="appeal_status"
              value="true"
              checked={formData.appeal_status === "true"}
              onChange={(e) => setFormData({ ...formData, appeal_status: e.target.value })}
            />
            <span>تم الطعن</span>
          </label>

          <label>
            <input
              type="radio"
              name="appeal_status"
              value="false"
              checked={formData.appeal_status === "false"}
              onChange={(e) => setFormData({ ...formData, appeal_status: e.target.value })}
            />
            <span>لم يتم الطعن</span>
          </label>
        </div>



        <label>حالة القضية</label>
        <select name="case_status" value={formData.case_status} onChange={handleChange}>
          <option value="">اختيار...</option>
          {CASE_STATUS_CHOICES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <label>تاريخ الحفظ</label>
        <input type="date" name="saved_date" value={formData.saved_date} onChange={handleChange} />

        <label>ملاحظات الدعوى</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>

        <label>ملف الدعوى</label>
        <input type="file" name="file" onChange={handleChange} />

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "حفظ القضية"}
          </button>

          <button type="button" className="btn btn-secondary" onClick={() => navigate("/cases")}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
