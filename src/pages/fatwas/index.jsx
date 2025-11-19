import { useEffect, useMemo, useState, useContext } from "react";
import { listFatwas, createFatwa, updateFatwa, deleteFatwa } from "../../apis/fatwas";
import { AuthContext } from "../../context/AuthContext";

export default function FatwasPage() {
  const { user } = useContext(AuthContext);

  const [fatwas, setFatwas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [generalNumber, setGeneralNumber] = useState("");
  const [date, setDate] = useState("");

  // form
  const [requestContent, setRequestContent] = useState("");
  const [result, setResult] = useState("");
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const userDepartmentId = useMemo(() => user?.department?.id || user?.department, [user]);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil((fatwas?.length || 0) / pageSize));
  const pagedFatwas = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return (fatwas || []).slice(start, end);
  }, [fatwas, page, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listFatwas({
        general_number: generalNumber || undefined,
        date: date || undefined,
      });
      setFatwas(data);
      setPage(1);
    } catch (e) {
      setError("تعذر تحميل الفتاوى");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    await fetchData();
  };

  const resetForm = () => {
    setRequestContent("");
    setResult("");
    setFile(null);
    setEditingId(null);
  };

  const buildFormData = () => {
    const fd = new FormData();
    if (requestContent) fd.append("request_content", requestContent);
    if (result) fd.append("result", result);
    if (file) fd.append("file", file);
    if (!editingId && userDepartmentId) fd.append("department", userDepartmentId);
    return fd;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fd = buildFormData();
      await createFatwa(fd);
      resetForm();
      await fetchData();
    } catch (e) {
      setError("فشل إنشاء الفتوى. تأكد من المحتوى والإدارة.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setLoading(true);
    setError("");
    try {
      const fd = buildFormData();
      await updateFatwa(editingId, fd);
      resetForm();
      await fetchData();
    } catch (e) {
      setError("فشل تحديث الفتوى.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (f) => {
    setEditingId(f.id);
    setRequestContent(f.request_content || "");
    setResult(f.result || "");
    setFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من الحذف؟")) return;
    setLoading(true);
    setError("");
    try {
      await deleteFatwa(id);
      await fetchData();
    } catch (e) {
      setError("تعذر حذف الفتوى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h3 className="mb-3">الفتاوى</h3>

      <form className="row g-2 align-items-end mb-3" onSubmit={handleSearch}>
        <div className="col-sm-3">
          <label className="form-label">رقم الحصر</label>
          <input
            className="form-control"
            value={generalNumber}
            onChange={(e) => setGeneralNumber(e.target.value)}
            placeholder="مثال: 123"
          />
        </div>
        <div className="col-sm-3">
          <label className="form-label">التاريخ</label>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="col-sm-2">
          <button type="submit" className="btn btn-secondary w-100">بحث</button>
        </div>
        <div className="col-sm-2">
          <button type="button" className="btn btn-outline-secondary w-100" onClick={() => { setGeneralNumber(""); setDate(""); fetchData(); }}>تصفية</button>
        </div>
      </form>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row">
        <div className="col-lg-6 mb-3">
          <div className="card">
            <div className="card-header">{editingId ? "تعديل فتوى" : "إضافة فتوى"}</div>
            <div className="card-body">
              <form onSubmit={editingId ? handleUpdate : handleCreate}>
                <div className="mb-2">
                  <label className="form-label">محتوى الطلب</label>
                  <textarea className="form-control" rows={4} value={requestContent} onChange={(e) => setRequestContent(e.target.value)} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">النتيجة</label>
                  <textarea className="form-control" rows={3} value={result} onChange={(e) => setResult(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">ملف مرفق (اختياري)</label>
                  <input type="file" className="form-control" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                {!editingId && !userDepartmentId && (
                  <div className="alert alert-warning py-2">لا توجد إدارة للمستخدم. لا يمكن إنشاء فتوى دون تحديد الإدارة.</div>
                )}
                <div className="d-flex gap-2">
                  <button disabled={loading || (!editingId && !userDepartmentId)} type="submit" className="btn btn-primary">
                    {editingId ? "تحديث" : "إضافة"}
                  </button>
                  {editingId && (
                    <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>إلغاء</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>قائمة الفتاوى</span>
              {loading && <span className="spinner-border spinner-border-sm" role="status" />}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>رقم الحصر</th>
                      <th>التاريخ</th>
                      <th>الإدارة</th>
                      <th>منشئ السجل</th>
                      <th>مقتطف</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fatwas.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-3">لا توجد بيانات</td></tr>
                    )}
                    {pagedFatwas.map((f) => (
                      <tr key={f.id}>
                        <td>{f.general_number ?? "-"}</td>
                        <td>{new Date(f.created_at).toLocaleDateString()}</td>
                        <td>{f.department_name || f.department || "-"}</td>
                        <td>{f.created_by_name || f.created_by || "-"}</td>
                        <td title={f.request_content}>{(f.request_content || "").slice(0, 40)}{(f.request_content || "").length > 40 ? "…" : ""}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={() => handleEdit(f)}>تعديل</button>
                            <button className="btn btn-outline-danger" onClick={() => handleDelete(f.id)}>حذف</button>
                            {f.file && (
                              <a className="btn btn-outline-secondary" href={f.file} target="_blank" rel="noreferrer">ملف</a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center p-2">
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label m-0">حجم الصفحة</label>
                  <select className="form-select form-select-sm" style={{ width: 80 }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                <div className="btn-group">
                  <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>السابق</button>
                  <span className="btn btn-sm btn-light disabled">صفحة {page} من {totalPages}</span>
                  <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>التالي</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
