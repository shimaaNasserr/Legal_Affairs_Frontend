import { useEffect, useMemo, useState, useContext } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { listContracts, deleteContract } from "../../apis/contracts";
import { AuthContext } from "../../context/AuthContext";

const CONTRACT_TYPES = [
  { value: "", label: "الكل" },
  { value: "tender", label: "مناقصة" },
  { value: "practice", label: "ممارسة" },
  { value: "direct", label: "أمر مباشر" },
  { value: "protocol", label: "بروتوكول إسناد" },
];

export default function ContractsList() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const role = user?.role || user?.role?.name || "";
  const canManage = ["president", "general_manager", "department_manager"].includes(role);

  const filters = useMemo(
    () => ({
      contract_type: searchParams.get("contract_type") || "",
      general_number: searchParams.get("general_number") || "",
      date_from: searchParams.get("date_from") || "",
      date_to: searchParams.get("date_to") || "",
    }),
    [searchParams]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await listContracts(filters);
      setData(Array.isArray(res) ? res : res.results || []);
    } catch (e) {
      setError("فشل تحميل العقود");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.contract_type, filters.general_number, filters.date_from, filters.date_to]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true });
  };

  const onDelete = async (id) => {
    if (!window.confirm("هل تريد حذف العقد؟")) return;
    await deleteContract(id);
    fetchData();
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>العقود</h3>
        {canManage && (
          <Link className="btn btn-primary" to="/contracts/new">إضافة عقد</Link>
        )}
      </div>

      <div className="card mb-3">
        <div className="card-body row g-2">
          <div className="col-12 col-md-3">
            <label className="form-label">نوع العقد</label>
            <select name="contract_type" value={filters.contract_type} onChange={onFilterChange} className="form-select">
              {CONTRACT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">رقم الحصر العام</label>
            <input name="general_number" value={filters.general_number} onChange={onFilterChange} className="form-control" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">من تاريخ</label>
            <input type="date" name="date_from" value={filters.date_from} onChange={onFilterChange} className="form-control" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">إلى تاريخ</label>
            <input type="date" name="date_to" value={filters.date_to} onChange={onFilterChange} className="form-control" />
          </div>
        </div>
      </div>

      {loading && <div>جاري التحميل...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>رقم الحصر العام</th>
                <th>رقم العقد</th>
                <th>النوع</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id}>
                  <td>{c.date_received}</td>
                  <td>{c.general_number}</td>
                  <td>{c.contract_number}</td>
                  <td>{CONTRACT_TYPES.find(t=>t.value===c.contract_type)?.label || c.contract_type}</td>
                  <td className="d-flex gap-2">
                    <Link className="btn btn-sm btn-outline-secondary" to={`/contracts/${c.id}`}>عرض</Link>
                    {canManage && (
                      <>
                        <Link className="btn btn-sm btn-outline-primary" to={`/contracts/${c.id}/edit`}>تعديل</Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(c.id)}>حذف</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
