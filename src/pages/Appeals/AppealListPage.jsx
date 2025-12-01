import { Link } from "react-router-dom";
import { useGetAppealsQuery } from "../../services/api";

export default function AppealListPage() {
  // Use cached query - data is automatically cached and reused
  const { data: items, isLoading: loading, error } = useGetAppealsQuery();

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>التظلمات</h4>
        <Link className="btn btn-primary" to="/appeals/new">
          إضافة تظلم
        </Link>
      </div>
      {loading && <div>جاري التحميل...</div>}
      {error && <div className="alert alert-danger">{String(error)}</div>}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>الرقم</th>
              <th>التحقيق</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items?.map((a) => (
              <tr key={a.id}>
                <td>{a.appeal_number}</td>
                <td>{a.investigation}</td>
                <td>
                  <Link
                    to={`/appeals/${a.id}`}
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
