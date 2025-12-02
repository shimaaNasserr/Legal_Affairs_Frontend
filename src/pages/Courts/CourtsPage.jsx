import React from "react";
import { useGetCourtsQuery } from "../../services/api";

export default function CourtsPage({ onSelectCourt }) {
  // Use cached query - data is automatically cached and reused
  const { data: courtsData, isLoading: loading, error: queryError } = useGetCourtsQuery();
  const courts = courtsData?.results || courtsData || [];
  const error = queryError ? "حدث خطأ أثناء جلب بيانات المحاكم" : "";

  if (loading) return <p>جاري تحميل المحاكم...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>اختر المحكمة لإضافة القضية</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
        {courts.map((court) => (
          <div
            key={court.id}
            onClick={() => onSelectCourt(court)}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            <h4>{court.name}</h4>
            <p>{court.description || "لا توجد ملاحظات"}</p>
            {court.children?.length > 0 && (
              <div style={{ marginTop: "10px", paddingLeft: "10px" }}>
                {court.children.map((child) => (
                  <div key={child.id} style={{ border: "1px dashed #aaa", padding: "5px", marginTop: "5px" }}>
                    {child.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
