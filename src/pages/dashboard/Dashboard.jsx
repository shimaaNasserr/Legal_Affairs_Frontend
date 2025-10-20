import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../apis/axiosInstance";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const role = user?.role?.name || user?.role || "";
  const [stats, setStats] = useState({ cases: 0, investigations: 0, appeals: 0, contracts: 0, fatwas: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        // Contracts: use existing endpoint; count array or paginated results
        const res = await axiosInstance.get("contracts/");
        const contractsCount = Array.isArray(res.data) ? res.data.length : (res.data.count ?? (res.data.results?.length || 0));
        setStats((s) => ({ ...s, contracts: contractsCount }));
        // TODO: add calls for cases/investigations/appeals/fatwas when endpoints are available
      } catch (e) {
        setError("تعذر تحميل الإحصائيات");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container py-3">
      <h3>لوحة التحكم</h3>
      <p className="text-muted">الدور: {role}</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        {(["cases","contracts","investigations","appeals","fatwas"]).map((k)=> (
          <div className="col-12 col-md-4 col-lg-3" key={k}>
            <div className="card p-3">
              <div className="fw-bold">{k}</div>
              <div className="display-6">{stats[k]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
