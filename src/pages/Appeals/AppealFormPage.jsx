import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAppeal } from "../../features/appeals/appealSlice";
import { fetchInvestigations } from "../../features/investigations/investigationSlice";

export default function AppealFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.appeals);
  const investigations = useSelector((s) => s.investigations.items);
  const [form, setForm] = useState({
    number: "",
    investigation: "",
    appellant_name: "",
    appeal_reason: "",
    date_submitted: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!investigations || investigations.length === 0) {
      dispatch(fetchInvestigations());
    }
  }, [dispatch]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries({
      number: form.number,
      investigation: form.investigation,
      appellant_name: form.appellant_name,
      appeal_reason: form.appeal_reason,
      date_submitted: form.date_submitted,
    }).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        data.append(k, v);
      }
    });
    if (file) data.append("file", file);
    const res = await dispatch(createAppeal(data));
    if (res.meta.requestStatus === "fulfilled") {
      navigate("/appeals");
    }
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-3">إضافة تظلم</h4>
      {error && <div className="alert alert-danger">{String(error)}</div>}
      <form className="card p-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">رقم التظلم</label>
            <input
              name="number"
              className="form-control"
              value={form.number}
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
            <label className="form-label">اسم المستأنف</label>
            <input
              name="appellant_name"
              className="form-control"
              value={form.appellant_name}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">تاريخ التقديم</label>
            <input
              type="date"
              name="date_submitted"
              className="form-control"
              value={form.date_submitted}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">سبب التظلم</label>
            <textarea
              name="appeal_reason"
              className="form-control"
              rows="3"
              value={form.appeal_reason}
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
        <div className="mt-3 d-flex gap-2">
          <button disabled={loading} className="btn btn-primary" type="submit">
            حفظ
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(-1)}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
