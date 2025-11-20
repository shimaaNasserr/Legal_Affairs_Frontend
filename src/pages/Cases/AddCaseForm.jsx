// src/pages/Cases/AddCaseForm.jsx
import React, { useState } from "react";
import axiosInstance from "../../apis/axiosInstance";
import "./caseStyles.css";

export default function AddCaseForm({ selectedCourt, onCaseAdded }) {
  const [formData, setFormData] = useState({
    date_received: "",
    case_number: "",
    lawsuit_number: "",
    court: selectedCourt?.id || "",
    plaintiff: "",
    defendant: "",
    requests: "",
    hearing_date: "",
    verdict: "",
    appeal_status: "", // اختياري
    date_saved: "",
    notes: "",
    file: null, // اختياري
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] || null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // تحقق من الحقول المطلوبة الأساسية
    const requiredFields = ["date_received", "case_number", "lawsuit_number", "plaintiff", "defendant"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`الرجاء ملء الحقل: ${field}`);
        return;
      }
    }

    const dataToSend = new FormData();
    dataToSend.append("date_received", formData.date_received);
    dataToSend.append("case_number", formData.case_number);
    dataToSend.append("lawsuit_number", formData.lawsuit_number);
    dataToSend.append("court", selectedCourt.id);
    dataToSend.append("plaintiff", formData.plaintiff);
    dataToSend.append("defendant", formData.defendant);
    dataToSend.append("requests", formData.requests);
    dataToSend.append("hearing_dates", formData.hearing_date ? formData.hearing_date.toString() : "");
    dataToSend.append("verdict", formData.verdict);
    dataToSend.append("appeal_status", formData.appeal_status === "" ? null : formData.appeal_status); // اختياري
    dataToSend.append("date_saved", formData.date_saved);
    dataToSend.append("notes", formData.notes);
    if (formData.file) dataToSend.append("file", formData.file); // اختياري

    try {
      const res = await axiosInstance.post("/cases/", dataToSend);
      alert("تم إضافة القضية بنجاح");
      if (onCaseAdded) onCaseAdded(res.data);
    } catch (err) {
      console.error("Error adding case: ", err);
      alert("حدث خطأ أثناء إضافة القضية. تأكدي من ملء جميع الحقول المطلوبة.");
    }
  };

  return (
    <div className="add-case-container">
      <h2 className="title">إضافة قضية جديدة</h2>
      <form onSubmit={handleSubmit} className="case-form">
        <label>تاريخ ورود الدعوى</label>
        <input type="date" name="date_received" value={formData.date_received} onChange={handleChange} required />

        <label>رقم الحصر العام</label>
        <input type="text" value="سيتم توليده تلقائيًا" disabled />

        <label>رقم حصر القضايا</label>
        <input type="text" name="case_number" value={formData.case_number} onChange={handleChange} required />

        <label>رقم الدعوى والسنة القضائية</label>
        <input type="text" name="lawsuit_number" value={formData.lawsuit_number} onChange={handleChange} required />

        <label>المحكمة المرفوع أمامها الدعوى</label>
        <input type="text" value={selectedCourt?.name || ""} disabled />

        <label>اسم المدعي</label>
        <input type="text" name="plaintiff" value={formData.plaintiff} onChange={handleChange} required />

        <label>اسم المدعى عليه</label>
        <input type="text" name="defendant" value={formData.defendant} onChange={handleChange} required />

        <label>الطلبات</label>
        <textarea name="requests" value={formData.requests} onChange={handleChange}></textarea>

        <label>تاريخ الجلسة</label>
        <input type="date" name="hearing_date" value={formData.hearing_date} onChange={handleChange} />

        <label>الحكم الصادر في الدعوى</label>
        <div>
          <input type="radio" name="verdict" value="for_university" onChange={handleChange} /> لصالح الجامعة
          <input type="radio" name="verdict" value="against_university" onChange={handleChange} /> ضد الجامعة
        </div>

        <label>موقف الدعوى من الطعن</label>
        <select name="appeal_status" value={formData.appeal_status} onChange={handleChange}>
          <option value="">اختيار...</option>
          <option value={true}>تم الطعن</option>
          <option value={false}>لم يتم الطعن</option>
        </select>

        <label>تاريخ الحفظ</label>
        <input type="date" name="date_saved" value={formData.date_saved} onChange={handleChange} />

        <label>ملاحظات الدعوى</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>

        <label>ملف الدعوى (اختياري)</label>
        <input type="file" name="file" onChange={handleChange} />

        <button type="submit" className="submit-btn">إضافة القضية</button>
      </form>
    </div>
  );
}
