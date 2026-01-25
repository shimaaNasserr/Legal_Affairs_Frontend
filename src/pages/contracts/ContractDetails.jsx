import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { getContract } from "../../apis/contracts";
import { AuthContext } from "../../context/AuthContext";

const CONTRACT_TYPES = {
  tender: "مناقصة",
  practice: "ممارسة",
  direct: "أمر مباشر",
  protocol: "بروتوكول إسناد",
};

export default function ContractDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const role = user?.role || user?.role?.name || "";
  const canManage = [
    "president",
    "general_manager",
    "department_manager",
  ].includes(role);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getContract(id);
        setData(res);
      } catch (e) {
        setError("فشل تحميل تفاصيل العقد");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="container py-3">جاري التحميل...</div>;
  if (error)
    return (
      <div className="container py-3">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  if (!data) return null;

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>تفاصيل العقد</h3>
        <div className="d-flex gap-2">
          {canManage && (
            <Link
              className="btn btn-outline-primary"
              to={`/contracts/${id}/edit`}
            >
              تعديل
            </Link>
          )}
          <Link className="btn btn-secondary" to="/contracts">
            رجوع
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <strong>تاريخ الورود:</strong> {data.date_received}
            </div>
            <div className="col-md-4">
              <strong>رقم الحصر العام:</strong> {data.general_number}
            </div>
            <div className="col-md-4">
              <strong>رقم العقد:</strong> {data.contract_number}
            </div>
            <div className="col-md-4">
              <strong>نوع العقد:</strong>{" "}
              {CONTRACT_TYPES[data.contract_type] || data.contract_type}
            </div>
            <div className="col-md-4">
              <strong>تاريخ الحفظ:</strong> {data.archive_date || "-"}
            </div>
            <div className="col-md-4">
              <strong>تاريخ الانتهاء:</strong> {data.end_date || "-"}
            </div>
            <div className="col-12">
              <strong>مضمون العقد:</strong>
              <div className="mt-1">{data.content}</div>
            </div>
            <div className="col-12">
              <strong>ما تم في العقد:</strong>
              <div className="mt-1">{data.progress || "-"}</div>
            </div>
            {data.file && (
              <div className="col-12">
                <strong>الملف:</strong>{" "}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={async () => {
                    try {
                      const response = await fetch(data.file);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `contract-${data.id}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Error downloading file:", error);
                      alert("حدث خطأ أثناء تحميل الملف");
                    }
                  }}
                >
                  تحميل الملف
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
