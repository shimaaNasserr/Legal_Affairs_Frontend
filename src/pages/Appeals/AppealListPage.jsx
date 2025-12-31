import { Link } from "react-router-dom";
import { useGetAppealsQuery } from "../../services/api";
import { useState, useMemo } from "react";
import "./Appeals.css";

export default function AppealListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (searchTerm) p.search = searchTerm;
    if (dateFrom) p.date_from = dateFrom;
    if (dateTo) p.date_to = dateTo;
    return p;
  }, [searchTerm, dateFrom, dateTo]);

  const { data: items, isLoading: loading, error } = useGetAppealsQuery(params);

  return (
    <div className="appeals-page container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>التظلمات</h4>
        <Link className="btn btn-primary" to="/appeals/new">
          إضافة تظلم
        </Link>
      </div>

      <div className="d-flex gap-2 align-items-end mb-3">
        <div className="flex-grow-1">
          <label className="form-label">بحث بالاسم/الرقم</label>
          <input
            className="form-control"
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">من</label>
          <input className="form-control" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label className="form-label">إلى</label>
          <input className="form-control" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {loading && <div>جاري التحميل...</div>}
      {error && <div className="alert alert-danger">{String(error)}</div>}

      <div className="appeals-list">
        {(items || []).map((a) => (
          <div key={a.id} className="appeal-card">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="m-0">تظلم رقم {a.appeal_number || "-"}</h5>
              <span className="badge bg-secondary">{a.status || "-"}</span>
            </div>
            <div className="mb-2">
              <strong>اسم المستأنف:</strong> {a.appellant_name || "-"}
            </div>
            <div className="mb-2">
              <strong>التحقيق:</strong> {a.investigation || a.investigation_id || "-"}
            </div>
            <div className="mb-2">
              <strong>تاريخ التقديم:</strong> {a.date_submitted || "-"}
            </div>
            <div className="d-flex gap-2 mt-2">
              <Link className="btn btn-sm btn-primary" to={`/appeals/${a.id}`}>عرض</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
