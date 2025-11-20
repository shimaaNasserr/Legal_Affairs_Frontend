import React, { useState, useEffect } from "react";
import axiosInstance from "../../apis/axiosInstance";
import CourtsPage from "../Courts/CourtsPage";
import AddCaseForm from "./AddCaseForm";
import "./caseStyles.css";

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [unresolvedAppeals, setUnresolvedAppeals] = useState([]);

  // Fetch cases
  useEffect(() => {
    async function fetchCases() {
      try {
        const res = await axiosInstance.get("/cases/");
        setCases(res.data);
        setUnresolvedAppeals(res.data.filter((c) => c.appeal_status === null));
      } catch (err) {
        console.error("Error fetching cases:", err);
      }
    }
    fetchCases();
  }, []);

  const handleCaseAdded = (newCase) => {
    setCases((prev) => [newCase, ...prev]);
    if (newCase.appeal_status === null) {
      setUnresolvedAppeals((prev) => [...prev, newCase]);
    }
  };

  return (
    <div className="cases-page">
      {unresolvedAppeals.length > 0 && (
        <div className="notification">
          هناك {unresolvedAppeals.length} قضية لم يتم تحديد موقف الطعن فيها!
        </div>
      )}

      {!showForm && (
        <button
          className="add-case-btn"
          onClick={() => setShowForm(true)}
        >
          إضافة قضية جديدة
        </button>
      )}

      {showForm && !selectedCourt && (
        <CourtsPage
          onSelectCourt={(court) => setSelectedCourt(court)}
        />
      )}

      {showForm && selectedCourt && (
        <AddCaseForm
          selectedCourt={selectedCourt}
          onCaseAdded={handleCaseAdded}
          onCancel={() => {
            setSelectedCourt(null);
            setShowForm(false);
          }}
        />
      )}

      <div className="cases-grid">
        {cases.map((c) => (
          <div className="case-card" key={c.id}>
            <h4>
              {c.case_number} - {c.plaintiff} vs {c.defendant}
            </h4>
            <p>تاريخ ورود الدعوى: {c.date_received}</p>
            <p>رقم الحصر العام: {c.general_case_number}</p>
            <p>رقم حصر القضايا: {c.case_index_number}</p>
            <p>رقم الدعوى والسنة القضائية: {c.lawsuit_number}</p>
            <p>المحكمة: {c.court?.name || "غير محددة"}</p>
            <p>اسم المدعي: {c.plaintiff}</p>
            <p>اسم المدعى عليه: {c.defendant}</p>
            <p>الطلبات: {c.requests}</p>
            <p>تاريخ الجلسات: {c.session_dates}</p>
            <p>الحكم الصادر: {c.verdict}</p>
            <p>
              موقف الدعوى من الطعن:{" "}
              {c.appeal_status === true
                ? "تم الطعن"
                : c.appeal_status === false
                ? "لم يتم الطعن"
                : "غير محدد"}
            </p>
            <p>تاريخ الحفظ: {c.saved_date}</p>
            <p>ملاحظات الدعوى: {c.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
