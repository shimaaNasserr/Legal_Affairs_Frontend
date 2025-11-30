import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  setFilters,
  clearFilters,
} from "../../features/investigations/investigationSlice";
import { useGetInvestigationsQuery } from "../../services/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function InvestigationListPage() {
  const dispatch = useDispatch();
  const { filters } = useSelector((s) => s.investigations);
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Use cached query with filters
  const { data: items, isLoading: loading, error } = useGetInvestigationsQuery(filters);

  const onChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onApply = () => {
    dispatch(setFilters(localFilters));
  };

  const onReset = () => {
    setLocalFilters({ number: "", accused: "", complainant: "" });
    dispatch(clearFilters());
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>التحقيقات</h4>
        <Link className="btn btn-primary" to="/investigations/new">
          إضافة تحقيق
        </Link>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <input
                name="number"
                className="form-control"
                placeholder="رقم التحقيق"
                value={localFilters.number}
                onChange={onChange}
              />
            </div>
            <div className="col-md-3">
              <input
                name="accused"
                className="form-control"
                placeholder="المتهم"
                value={localFilters.accused}
                onChange={onChange}
              />
            </div>
            <div className="col-md-3">
              <input
                name="complainant"
                className="form-control"
                placeholder="الشاكي"
                value={localFilters.complainant}
                onChange={onChange}
              />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button className="btn btn-secondary" onClick={onApply}>
                تطبيق
              </button>
              <button className="btn btn-outline-secondary" onClick={onReset}>
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <div>جاري التحميل...</div>}
      {error && <div className="alert alert-danger">{String(error)}</div>}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>تاريخ الاستلام</th>
              <th>نوع التحقيق</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.title || inv.number}</td>
                <td>{inv.date_received}</td>
                <td>{inv.case_type}</td>
                <td>
                  <Link
                    to={`/investigations/${inv.id}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    تفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
