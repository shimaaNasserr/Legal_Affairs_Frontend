import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import "./Cases.css";

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/cases/${id}/`)
      .then((res) => setCaseItem(res.data))
      .catch(() => navigate("/cases"));
  }, [id, navigate]);

  if (!caseItem) return <p>جاري التحميل...</p>;

  const courtDisplay = caseItem.division_name
    ? `${caseItem.court_name} - ${caseItem.division_name}`
    : caseItem.court_name;

  return (
    <div className="case-details-page">
      <h2 className="page-title">تفاصيل القضية</h2>

      <div className="case-card details-card">
        <div className="case-card-body">
          <div className="detail-item">
            <strong>تاريخ ورود الدعوى:</strong> {caseItem.date_received || "-"}
          </div>

          <div className="detail-item">
            <strong>رقم الحصر العام:</strong> {caseItem.general_number || "-"}
          </div>

          <div className="detail-item">
            <strong>رقم حصر القضايا:</strong> {caseItem.case_number || "-"}
          </div>

          <div className="detail-item">
            <strong>رقم الدعوى والسنة القضائية:</strong> {caseItem.lawsuit_number || "-"}
          </div>

          <div className="detail-item">
            <strong>المحكمة:</strong> {courtDisplay || "-"}
          </div>

          <div className="detail-item">
            <strong>اسم المدعي:</strong> {caseItem.plaintiff || "-"}
          </div>

          <div className="detail-item">
            <strong>اسم المدعى عليه:</strong> {caseItem.defendant || "-"}
          </div>

          <div className="detail-item">
            <strong>الطلبات:</strong> {caseItem.requests || "-"}
          </div>

          {caseItem.hearing_dates && caseItem.hearing_dates.length > 0 && (
            <div className="detail-item">
              <strong>تاريخ الجلسات:</strong>
              <div className="hearing-dates-tags">
                {caseItem.hearing_dates.map((date, idx) => (
                  <span key={idx} className="hearing-tag">
                    {date}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-item">
            <strong>الحكم الصادر:</strong> {caseItem.ruling || "-"}
          </div>

          <div className="detail-item">
            <strong>موقف الدعوى من الطعن:</strong>{" "}
            {caseItem.appeal_status === null
              ? "-"
              : caseItem.appeal_status
              ? "تم الطعن"
              : "لم يتم الطعن"}
          </div>

          <div className="detail-item">
            <strong>تاريخ الحفظ:</strong> {caseItem.saved_date || "-"}
          </div>

          <div className="detail-item">
            <strong>ملاحظات الدعوى:</strong> {caseItem.notes || "-"}
          </div>

          {caseItem.file && (
            <div className="detail-item">
              <strong>ملف الدعوى:</strong>{" "}
              <a href={caseItem.file} target="_blank" rel="noopener noreferrer">
                تحميل الملف
              </a>
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-primary back-btn" onClick={() => navigate("/cases")}>
        العودة للقائمة
      </button>
    </div>
  );
}
