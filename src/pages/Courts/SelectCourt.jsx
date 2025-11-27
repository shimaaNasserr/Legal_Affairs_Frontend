import React, { useState, useEffect } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { useNavigate } from "react-router-dom";
import { BiBuilding } from "react-icons/bi";
import { FiLayers } from "react-icons/fi";
import "./courtsStyles.css";

export default function SelectCourt() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDivisions, setShowDivisions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const res = await axiosInstance.get("courts/");
      setCourts(res.data);
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل المحاكم");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourt = (court) => {
    if (court.divisions && court.divisions.length > 0) {
      setShowDivisions(court);
    } else {
      // تمرير اسم المحكمة فقط إذا مفيش أقسام
      navigate(`/add-case/${court.id}/${court.name}`);
    }
  };

  const handleSelectDivision = (division, courtId, courtName) => {
    // نمرر اسم المحكمة + اسم القسم للفورم
    navigate(`/add-case/${courtId}/${courtName}?divisionName=${division.name}`);
    setShowDivisions(null);
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="courts-page">
      <h2>اختر المحكمة</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="courts-grid">
        {courts.map((court) => (
          <div
            key={court.id}
            className="court-card fancy-card"
            onClick={() => handleSelectCourt(court)}
          >
            <div className="court-icon">
              <BiBuilding size={32} />
            </div>
            <h3>{court.name}</h3>

            <div className="badge-container">
              {/* عرض فقط إذا المحكمة لها أقسام */}
              {court.divisions && court.divisions.length > 0 && (
                <span className="badge divisions-badge">
                  <FiLayers /> {court.divisions.length} قسم
                </span>
              )}
              {court.open_cases_count !== undefined && (
                <span className="badge cases-badge">
                  {court.open_cases_count} قضية مفتوحة
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showDivisions && (
        <div className="divisions-popup">
          <div className="popup-content">
            <h3>اختر القسم في {showDivisions.name}</h3>
            <div className="divisions-grid">
              {showDivisions.divisions.map((div) => (
                <div
                  key={div.id}
                  className="division-card"
                  onClick={() =>
                    handleSelectDivision(div, showDivisions.id, showDivisions.name)
                  }
                >
                  <FiLayers size={16} color="#4f46e5" />
                  {div.name}
                </div>
              ))}
            </div>
            <button
              className="btn btn-secondary close-popup"
              onClick={() => setShowDivisions(null)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
