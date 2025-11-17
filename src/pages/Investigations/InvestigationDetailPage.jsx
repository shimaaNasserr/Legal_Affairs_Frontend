import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchInvestigationById } from "../../features/investigations/investigationSlice";

export default function InvestigationDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { item, loading, error } = useSelector((s) => s.investigations);

  useEffect(() => {
    if (id) dispatch(fetchInvestigationById(id));
  }, [dispatch, id]);

  if (loading) return <div className="container-fluid">جاري التحميل...</div>;
  if (error)
    return (
      <div className="container-fluid alert alert-danger">{String(error)}</div>
    );
  if (!item) return <div className="container-fluid">لا توجد بيانات</div>;

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">تفاصيل التحقيق #{item.general_number || "—"}</h5>
          {item.status && (
            <span className="badge text-bg-secondary">{item.status}</span>
          )}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-lg-12">
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">العنوان</span>
                  <span>{item.title || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">الأولوية</span>
                  <span>{item.priority || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">نوع القضية</span>
                  <span>{item.case_type || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">نوع الشاكي</span>
                  <span>{item.complainant_type ?? "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">اسم الشاكي</span>
                  <span>{item.complainant_name ?? "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">الكلية/الهيئة</span>
                  <span>{item.faculty_college ?? "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">تاريخ الاستلام</span>
                  <span>{item.date_received || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">القسم</span>
                  <span>{item.department_name || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">أنشأ بواسطة</span>
                  <span>{item.created_by_name || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">عدد التظلمات</span>
                  <span>{item.appeals_count ?? 0}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between text-muted small">
          <span>تم الإنشاء: {item.created_at || "—"}</span>
          <span>رقم عام: {item.general_number || "—"}</span>
        </div>
      </div>
    </div>
  );
}
