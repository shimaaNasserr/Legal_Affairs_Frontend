import { useParams } from "react-router-dom";
import { useGetAppealByIdQuery } from "../../services/api";
import axiosInstance from "../../apis/axiosInstance";

export default function AppealDetailPage() {
  const { id } = useParams();
  // Use cached query - data is automatically cached and reused
  const {
    data: item,
    isLoading: loading,
    error,
  } = useGetAppealByIdQuery(id, {
    skip: !id,
  });

  if (loading) return <div className="container-fluid">جاري التحميل...</div>;
  if (error)
    return (
      <div className="container-fluid alert alert-danger">{String(error)}</div>
    );
  if (!item) return <div className="container-fluid">لا توجد بيانات</div>;

  const handleDownload = async () => {
    if (!item?.file) return;
    try {
      const apiBase = new URL(axiosInstance.defaults.baseURL);
      const origin = `${apiBase.protocol}//${apiBase.host}`;
      const fileUrl = new URL(item.file, origin).href;
      const res = await axiosInstance.get(fileUrl, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const cd = res.headers["content-disposition"];
      let filename = "appeal_file";
      if (cd) {
        const m = cd.match(
          /filename\*=UTF-8''([^;]+)|filename=("?)([^";]+)\2/i
        );
        filename = decodeURIComponent(m?.[1] || m?.[3] || filename);
      } else {
        try {
          filename = (fileUrl || item.file).split("/").pop() || filename;
        } catch {}
      }
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      alert("تعذر تنزيل الملف");
    }
  };

  return (
    <div className="container-fluid">
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            تفاصيل التظلم #{item.appeal_number || item.number}
          </h5>
          {item.status && (
            <span className="badge text-bg-secondary">{item.status}</span>
          )}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-lg-7">
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">عنوان التحقيق</span>
                  <span>{item.investigation_title || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">رقم التظلم</span>
                  <span>{item.appeal_number || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">القسم</span>
                  <span>{item.department_name || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">مقدم الشكوى</span>
                  <span>{item.complainant_name || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">أنشأ بواسطة</span>
                  <span>{item.created_by_name || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">المستأنف</span>
                  <span>{item.appellant_name || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">تاريخ التقديم</span>
                  <span>{item.date_submitted || "—"}</span>
                </li>
                <li className="list-group-item px-0 d-flex justify-content-between">
                  <span className="text-muted">تاريخ المراجعة</span>
                  <span>{item.date_reviewed || "—"}</span>
                </li>
              </ul>
            </div>
            <div className="col-lg-5">
              <div className="mb-3">
                <h6 className="text-muted mb-1">سبب التظلم</h6>
                <div className="border rounded p-2 bg-light">
                  {item.appeal_reason || "—"}
                </div>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">القرار</h6>
                <div className="border rounded p-2 bg-light">
                  {item.decision || "—"}
                </div>
              </div>
              <div className="mb-3">
                <h6 className="text-muted mb-1">ملاحظات</h6>
                <div className="border rounded p-2 bg-light">
                  {item.notes || "—"}
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">ملف التظلم</h6>
                {item.file ? (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn btn-outline-primary btn-sm"
                  >
                    تنزيل الملف
                  </button>
                ) : (
                  <span className="text-muted">لا يوجد ملف</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between text-muted small">
          <span>تم الإنشاء: {item.created_at || "—"}</span>
          <span>آخر تحديث: {item.updated_at || "—"}</span>
        </div>
      </div>
    </div>
  );
}
