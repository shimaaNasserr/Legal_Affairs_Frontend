import { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../apis/axiosInstance.jsx";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ cases: 0, contracts: 0, fatwas: 0, investigations: 0 });

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get("reports/summary/");
      const d = res.data || {};
      setStats({
        cases: d.cases || 0,
        contracts: d.contracts || 0,
        fatwas: d.fatwas || 0,
        investigations: d.investigations || 0,
      });
    } catch (e) {
      setError("تعذر تحميل الإحصائيات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const total = Math.max(1, stats.cases + stats.contracts + stats.fatwas + stats.investigations);

  const labels = ["القضايا", "العقود", "الفتاوى", "التحقيقات"];
  const dataArray = [stats.cases, stats.contracts, stats.fatwas, stats.investigations];

  const barData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "عدد السجلات",
        data: dataArray,
        backgroundColor: ["#0d6efd", "#6610f2", "#198754", "#dc3545"],
        borderRadius: 6,
      },
    ],
  }), [stats]);

  const pieData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "النسبة",
        data: dataArray,
        backgroundColor: ["#0d6efd", "#6610f2", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  }), [stats]);

  const Item = ({ title, count, color }) => (
    <div className="col-md-3 col-sm-6 mb-3">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="m-0">{title}</h6>
            <span className="badge bg-secondary">{count}</span>
          </div>
          <div className="progress" role="progressbar" aria-label={title} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round((count / total) * 100)}>
            <div className="progress-bar" style={{ width: `${(count / total) * 100}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">التقارير والإحصائيات</h3>
        <button className="btn btn-outline-secondary" onClick={fetchStats} disabled={loading}>
          {loading ? "جارٍ التحديث..." : "تحديث"}
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row">
        <Item title="القضايا" count={stats.cases} color="#0d6efd" />
        <Item title="العقود" count={stats.contracts} color="#6610f2" />
        <Item title="الفتاوى" count={stats.fatwas} color="#198754" />
        <Item title="التحقيقات" count={stats.investigations} color="#dc3545" />
      </div>

      <div className="row mt-3">
        <div className="col-lg-7 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-3">توزيع السجلات (أعمدة)</h6>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>
        <div className="col-lg-5 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="mb-3">النسب (مخطط دائري)</h6>
              <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
