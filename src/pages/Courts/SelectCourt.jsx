import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiBuilding } from "react-icons/bi";
import { FiLayers } from "react-icons/fi";
import "./courtsStyles.css";

// RTK Query
import { useGetCourtsQuery } from "../../services/api";

export default function SelectCourt() {
  const navigate = useNavigate();
  const [showDivisions, setShowDivisions] = useState(null);

  // fetch courts using RTK Query
  const { data, error, isLoading } = useGetCourtsQuery();

  // لو الـ API بيرجع object فيه results
  const courts = Array.isArray(data)
    ? data
    : data?.results || [];

  const handleSelectCourt = (court) => {
    if (court.divisions && court.divisions.length > 0) {
      setShowDivisions(court);
    } else {
      navigate(`/add-case/${court.id}/${court.name}`);
    }
  };

  const handleSelectDivision = (division, courtId, courtName) => {
    navigate(`/add-case/${courtId}/${courtName}?divisionName=${division.name}`);
    setShowDivisions(null);
  };

  if (isLoading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="courts-page">
      <h2>اختر المحكمة</h2>

      {error && <div className="alert alert-danger">فشل في تحميل المحاكم</div>}

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
