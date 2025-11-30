import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateInvestigationMutation } from "../../services/api";

export default function InvestigationFormPage() {
  const navigate = useNavigate();
  const [createInvestigation, { isLoading: loading, error }] = useCreateInvestigationMutation();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "",
    description: "",
    accused_names: "",
    date_received: "",
    priority: "",
    case_type: "",
    complainant_type: "",
    complainant_name: "",
    faculty_college: "",
  });
  const [file, setFile] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Add all regular fields first
    // Object.entries(form).forEach(([k, v]) => {
    //   if (v === undefined || v === null || String(v).trim() === "") return;
    //   if (k !== "accused_names") {
    //     // Skip accused_names here
    //     data.append(k, v);
    //   }
    // });

    // Process accused_names separately
    // if (form.accused_names && form.accused_names.trim() !== "") {
    //   String(form.accused_names)
    //     .split(/[,،]/)
    //     .map((name) => name.trim())
    //     .filter(Boolean)
    //     .forEach((name) => data.append("accused_names", name)); // Same name, multiple values
    // }

    if (file) data.append("file", file);

    try {
      await createInvestigation(data).unwrap();
      navigate("/investigations");
      // Cache is automatically invalidated and refetched by RTK Query
    } catch (err) {
      console.error("Error creating investigation:", err);
    }
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-3">إضافة تحقيق</h4>
      {error && (
        <div className="alert alert-danger">
          {error?.data?.message || error?.message || String(error)}
        </div>
      )}
      <form className="card p-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">عنوان التحقيق</label>
            <input
              name="title"
              className="form-control"
              value={form.title}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">الأولوية</label>
            <select
              name="priority"
              className="form-select"
              value={form.priority}
              onChange={onChange}
            >
              <option value="">— اختر —</option>
              <option value="low">منخفض</option>
              <option value="medium">متوسط</option>
              <option value="high">مرتفع</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">نوع القضية</label>
            <select
              name="case_type"
              className="form-select"
              value={form.case_type}
              onChange={onChange}
            >
              <option value="">— اختر —</option>
              <option value="internal_disciplinary">تأديبية داخلية</option>
              <option value="external">خارجية</option>
              <option value="complaint">شكوى</option>
            </select>
          </div>
          <div className="col-md-8">
            <label className="form-label">تاريخ الاستلام</label>
            <input
              type="date"
              name="date_received"
              className="form-control"
              value={form.date_received}
              onChange={onChange}
              max={today}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">نوع الشاكي</label>
            <input
              name="complainant_type"
              className="form-control"
              value={form.complainant_type}
              onChange={onChange}
              placeholder="مثال: موظف، طالب، جهة خارجية"
            />
          </div>
          <div className="col-md-8">
            <label className="form-label">اسم الشاكي</label>
            <input
              name="complainant_name"
              className="form-control"
              value={form.complainant_name}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">الكلية/الهيئة</label>
            <input
              name="faculty_college"
              className="form-control"
              value={form.faculty_college}
              onChange={onChange}
            />
          </div>
          <div className="col-12">
            <label className="form-label">الوصف</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={form.description}
              onChange={onChange}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">أسماء المتهمين</label>
            <input
              name="accused_names"
              className="form-control"
              value={form.accused_names}
              // onChange={onChange}
              placeholder="افصل بين الأسماء بفاصلة إن لزم"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">ملف التحقيق</label>
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
