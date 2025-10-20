import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createContract, getContract, updateContract } from "../../apis/contracts";
import { AuthContext } from "../../context/AuthContext";

const CONTRACT_TYPES = [
  { value: "tender", label: "مناقصة" },
  { value: "practice", label: "ممارسة" },
  { value: "direct", label: "أمر مباشر" },
  { value: "protocol", label: "بروتوكول إسناد" },
];

const ALLOWED_EXT = ["pdf", "doc", "docx", "png", "jpg", "jpeg"];
const MAX_SIZE_MB = 10;

export default function ContractForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const role = user?.role || user?.role?.name || "";
  const canManage = ["president", "general_manager", "department_manager"].includes(role);

  const [form, setForm] = useState({
    date_received: "",
    general_number: "",
    contract_number: "",
    contract_type: "tender",
    content: "",
    progress: "",
    archive_date: "",
    end_date: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canManage) {
      navigate("/contracts", { replace: true });
      return;
    }
    const load = async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const data = await getContract(id);
        setForm({
          date_received: data.date_received || "",
          general_number: data.general_number || "",
          contract_number: data.contract_number || "",
          contract_type: data.contract_type || "tender",
          content: data.content || "",
          progress: data.progress || "",
          archive_date: data.archive_date || "",
          end_date: data.end_date || "",
          file: null,
        });
      } catch (e) {
        setError("فشل تحميل بيانات العقد");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, canManage, navigate]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      const file = files && files[0];
      if (file) {
        const ext = file.name.split(".").pop().toLowerCase();
        const sizeMb = file.size / (1024 * 1024);
        if (!ALLOWED_EXT.includes(ext)) {
          setError("صيغة الملف غير مدعومة. المسموح: PDF, DOC, DOCX, PNG, JPG");
          return;
        }
        if (sizeMb > MAX_SIZE_MB) {
          setError(`حجم الملف يتجاوز ${MAX_SIZE_MB} ميجابايت`);
          return;
        }
      }
      setForm((f) => ({ ...f, file }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") {
          fd.append(k, v);
        }
      });
      if (isEdit) {
        await updateContract(id, fd);
      } else {
        await createContract(fd);
      }
      navigate("/contracts");
    } catch (e) {
      setError("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h3 className="mb-3">{isEdit ? "تعديل عقد" : "إضافة عقد"}</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit} className="card p-3">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">تاريخ الورود</label>
            <input type="date" name="date_received" value={form.date_received} onChange={onChange} className="form-control" required />
          </div>
          <div className="col-md-4">
            <label className="form-label">رقم الحصر العام</label>
            <input name="general_number" value={form.general_number} onChange={onChange} className="form-control" required />
          </div>
          <div className="col-md-4">
            <label className="form-label">رقم العقد</label>
            <input name="contract_number" value={form.contract_number} onChange={onChange} className="form-control" required />
          </div>

          <div className="col-md-4">
            <label className="form-label">نوع العقد</label>
            <select name="contract_type" value={form.contract_type} onChange={onChange} className="form-select" required>
              {CONTRACT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="col-md-8">
            <label className="form-label">مضمون العقد</label>
            <textarea name="content" value={form.content} onChange={onChange} className="form-control" rows={3} required />
          </div>

          <div className="col-12">
            <label className="form-label">ما تم في العقد</label>
            <textarea name="progress" value={form.progress} onChange={onChange} className="form-control" rows={3} />
          </div>

          <div className="col-md-6">
            <label className="form-label">تاريخ الحفظ</label>
            <input type="date" name="archive_date" value={form.archive_date} onChange={onChange} className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">تاريخ الانتهاء</label>
            <input type="date" name="end_date" value={form.end_date} onChange={onChange} className="form-control" />
          </div>

          <div className="col-12">
            <label className="form-label">ملف العقد (PDF/DOC/DOCX/PNG/JPG) - اختياري</label>
            <input type="file" name="file" onChange={onChange} className="form-control" accept={ALLOWED_EXT.map(e=>"."+e).join(",")} />
          </div>
        </div>
        <div className="mt-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>{isEdit ? "حفظ التعديلات" : "إضافة"}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>رجوع</button>
        </div>
      </form>
    </div>
  );
}
