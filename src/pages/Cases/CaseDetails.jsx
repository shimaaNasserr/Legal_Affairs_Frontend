import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import "./Cases.css";

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/cases/${id}/`)
      .then(res => setCaseItem(res.data))
      .catch(() => navigate("/cases"));
  }, [id, navigate]);

  if (!caseItem) return <p>جاري التحميل...</p>;

  return (
    <div className="case-details-page">
      <h2>تفاصيل القضية</h2>

      <div className="case-card">
        <div className="case-card-body">
            <div><strong>تاريخ ورود الدعوى:</strong> {caseItem.date_received}</div>
            <div><strong>رقم الحصر العام:</strong> {caseItem.general_number}</div>
            <div><strong>رقم حصر القضايا:</strong> {caseItem.case_number}</div>
            <div><strong>رقم الدعوى والسنة القضائية:</strong> {caseItem.lawsuit_number}</div>
            <div>
            <strong>المحكمة:</strong>{caseItem.court_full_name}</div>



            <div><strong>اسم المدعي:</strong> {caseItem.plaintiff}</div>
            <div><strong>اسم المدعى عليه:</strong> {caseItem.defendant}</div>
            <div><strong>الطلبات:</strong> {caseItem.requests}</div>
            <div><strong>تاريخ الجلسات:</strong> {caseItem.hearing_dates}</div>
            <div><strong>الحكم الصادر:</strong> {caseItem.ruling || "-"}</div>
            <div><strong>موقف الدعوى من الطعن:</strong> {caseItem.appeal_status ? "تم الطعن" : "لم يتم الطعن"}</div>
            <div><strong>تاريخ الحفظ:</strong> {caseItem.saved_date || "-"}</div>
            <div><strong>ملاحظات الدعوى:</strong> {caseItem.notes}</div>

          {caseItem.file && (
            <div>
              <strong>ملف الدعوى:</strong>{" "}
              <a href={caseItem.file} target="_blank" rel="noopener noreferrer">تحميل الملف</a>
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => navigate("/cases")}>
        العودة للقائمة
      </button>
    </div>
  );
}
