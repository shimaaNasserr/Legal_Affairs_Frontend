import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [secretaries, setSecretaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role === "Lawyer") {
      fetchLawyerData();
    }
  }, [user]);

  const fetchLawyerData = async () => {
    try {
      // جلب قضايا المحامي
      const casesRes = await axiosInstance.get(`cases/my-cases/`);
      setCases(casesRes.data);

      // جلب السكرتارية المرتبطة - استخدام LawyerSecretaryAccess
      const secretariesRes = await axiosInstance.get(
        `cases/secretary-access/`
      );
      // استخراج السكرتارية من النتائج
      const secretariesList = secretariesRes.data
        .filter(access => access.lawyer === user.id)
        .map(access => ({
          id: access.secretary,
          first_name: access.secretary_name?.split(' ')[0] || '',
          last_name: access.secretary_name?.split(' ').slice(1).join(' ') || '',
          email: access.secretary_email || '',
        }));
      setSecretaries(secretariesList);
    } catch (err) {
      console.error("Error fetching lawyer data:", err);
      setError("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-info">
          <h2>
            {user?.first_name} {user?.last_name}
          </h2>
          <p className="role-badge">محامي</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="profile-sections">
        <div className="profile-section">
          <h3>قضاياي ({cases.length})</h3>
          <div className="cases-list">
            {cases.length === 0 ? (
              <p className="empty-state">لا توجد قضايا مخصصة لك</p>
            ) : (
              cases.map((caseItem) => (
                <div key={caseItem.id} className="case-card">
                  <div className="case-header">
                    <h4>{caseItem.title}</h4>
                    <span
                      className={`status-badge status-${caseItem.status}`}
                    >
                      {caseItem.status}
                    </span>
                  </div>
                  <p className="case-description">{caseItem.description}</p>
                  <div className="case-meta">
                    <span>
                      <i className="ri-calendar-line"></i>{" "}
                      {new Date(caseItem.created_at).toLocaleDateString("ar")}
                    </span>
                    <span>
                      <i className="ri-building-line"></i> {caseItem.department}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>السكرتارية المرتبطة ({secretaries.length})</h3>
          <div className="secretaries-list">
            {secretaries.length === 0 ? (
              <p className="empty-state">لا توجد سكرتارية مرتبطة بك</p>
            ) : (
              secretaries.map((secretary) => (
                <div key={secretary.id} className="secretary-card">
                  <div className="secretary-info">
                    <i className="ri-user-3-line"></i>
                    <div>
                      <h4>
                        {secretary.first_name} {secretary.last_name}
                      </h4>
                      <p>{secretary.email}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

