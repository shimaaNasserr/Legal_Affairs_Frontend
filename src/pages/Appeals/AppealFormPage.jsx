import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateAppealMutation,
  useGetInvestigationsQuery,
} from "../../services/api";

export default function AppealFormPage() {
  const navigate = useNavigate();
  const [createAppeal, { isLoading: loading, error }] =
    useCreateAppealMutation();
  // Use cached query for investigations - data is automatically cached
  const { data: investigations = [] } = useGetInvestigationsQuery();
  const [form, setForm] = useState({
    title: "",
    investigation: "",
    accused_names: "",
    description: "",
    date_received: "",
  });
  const [file, setFile] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries({
      title: form.title,
      investigation: form.investigation,
      accused_names: form.accused_names,
      description: form.description,
      date_received: form.date_received,
    }).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        data.append(k, v);
      }
    });
    if (file) data.append("file", file);
    try {
      await createAppeal(data).unwrap();
      navigate("/appeals");
      // Cache is automatically invalidated and refetched by RTK Query
    } catch (err) {
      console.error("Error creating appeal:", err);
    }
  };

  return (
    <div className="container-fluid position-relative">
      <h4 className="mb-3">إضافة تظلم</h4>
      {error && (
        <div className="alert alert-danger">
          {error?.data?.message || error?.message || String(error)}
        </div>
      )}
      <form className="card p-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">عنوان التظلم</label>
            <input
              name="title"
              className="form-control"
              value={form.title}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">اختر التحقيق</label>
            <select
              name="investigation"
              className="form-select"
              value={form.investigation}
              onChange={onChange}
              required
            >
              <option value="" disabled>
                — اختر —
              </option>
              {investigations?.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.title || inv.number}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">أسماء المتهمين</label>
            <input
              name="accused_names"
              className="form-control"
              value={form.accused_names}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">تاريخ الاستلام</label>
            <input
              type="date"
              name="date_received"
              className="form-control"
              value={form.date_received}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">وصف التظلم</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={form.description}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">ملف التظلم</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <div className="mt-3 d-flex gap-2 align-items-center">
          <button disabled={loading} className="btn btn-primary" type="submit">
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                جارٍ الحفظ...
              </>
            ) : (
              "حفظ"
            )}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            إلغاء
          </button>
        </div>
      </form>
      {loading && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}
