import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Cases.css";

const ITEMS_PER_PAGE = 8;
const CACHE_KEY = "cases_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const CASE_STATUS_NAMES = {
  pending: "قيد الانتظار",
  under_study: "قيد الدراسة",
  in_court: "قيد التقاضي",
  closed: "منتهية",
  appealed: "قيد الاستئناف",
};

const Cases = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appealNotifications, setAppealNotifications] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchCases = useCallback(async () => {
    if (!user) return;

    // Check cache first
    const now = Date.now();
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // Use cached data if it's not expired
      if (now - timestamp < CACHE_DURATION) {
        setCases(data);
        setAppealNotifications(data.filter((c) => c.appeal_status === null));
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      let { data } = await axiosInstance.get("cases/");

      // Filter cases for lawyers in إدارة القضايا
      if (user.role === "Lawyer" && user.department_name === "إدارة القضايا") {
        data = data.filter((c) => c.created_by === user.id);
      }

      // Update cache
      const cacheData = {
        data,
        timestamp: now,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setLastFetchTime(now);

      setCases(data);
      setAppealNotifications(data.filter((c) => c.appeal_status === null));
    } catch (err) {
      console.error("❌ Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCases();
  }, [user]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        c.case_number?.toLowerCase().includes(search) ||
        c.lawsuit_number?.toLowerCase().includes(search) ||
        c.plaintiff?.toLowerCase().includes(search) ||
        c.defendant?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || c.case_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cases, searchTerm, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCases, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const canEditCase = (c) => {
    if (!user) return false;
    if (user.role === "Lawyer" && user.department_name === "إدارة القضايا")
      return c.created_by === user.id;
    return ["President", "GeneralManager", "DepartmentManager"].includes(
      user.role
    );
  };

  const canDeleteCase = (c) => {
    if (!user) return false;
    return ["GeneralManager", "DepartmentManager"].includes(user.role);
  };

  const canAddCase = () => {
    if (!user) return false;
    const deptName = user.department_name || "";
    if (user.role === "Lawyer" && deptName === "إدارة القضايا") return true;
    return ["President", "GeneralManager", "DepartmentManager"].includes(
      user.role
    );
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/cases/${id}/`);
      setCases((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("فشل حذف القضية", err);
      setConfirmDeleteId(null);
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <div className="cases-page">
      <div className="page-header">
        <h2>إدارة القضايا</h2>

        {canAddCase() && (
          <button
            className="btn btn-primary add-btn"
            onClick={() => navigate("/select-court")}
          >
            <i className="ri-add-circle-line"></i> إضافة قضية جديدة
          </button>
        )}
      </div>

      {appealNotifications.length > 0 && (
        <div className="alert alert-warning appeal-alert">
          ⚠ هناك {appealNotifications.length} قضية لم يتم تحديد موقف الطعن لها!
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="بحث في القضايا..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">جميع الحالات</option>
          {Object.entries(CASE_STATUS_NAMES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="pagination-info">
        <span>إجمالي النتائج: {filteredCases.length}</span>
        <span>
          الصفحة {currentPage} من {totalPages || 1}
        </span>
      </div>

      <div className="cases-grid">
        {currentItems.length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد قضايا</p>
          </div>
        ) : (
          currentItems.map((c) => {
            const hasDivision =
              c.division_name &&
              c.division_name.trim() !== "-" &&
              c.division_name.trim() !== "";

            const courtDisplay = hasDivision
              ? `${c.court_name} - ${c.division_name}`
              : c.court_name;

            return (
              <div key={c.id} className="case-card">
                {/* header */}
                <div className="case-card-header">
                  <h3>
                    {c.plaintiff} vs {c.defendant}
                  </h3>
                  <span className={`status-badge status-${c.case_status}`}>
                    {CASE_STATUS_NAMES[c.case_status]}
                  </span>
                </div>

                {/* body */}
                <div className="case-card-body">
                  <div>
                    <strong>رقم القضية:</strong> {c.case_number}
                  </div>
                  <div>
                    <strong>رقم الحصر العام:</strong> {c.general_number}
                  </div>
                  <div>
                    <strong>رقم الدعوى:</strong> {c.lawsuit_number}
                  </div>
                  <div>
                    <strong>المحكمة:</strong> {courtDisplay}
                  </div>
                  <div>
                    <strong>تاريخ ورود الدعوى:</strong> {c.date_received}
                  </div>
                  <div>
                    <strong>موقف الطعن:</strong>
                    {c.appeal_status === null
                      ? "غير محدد"
                      : c.appeal_status === true
                      ? "تم الطعن"
                      : "لم يتم الطعن"}
                  </div>
                </div>

                {/* actions */}
                <div className="case-card-actions">
                  <button
                    className="btn btn-sm btn-view"
                    onClick={() => navigate(`/cases/${c.id}`)}
                  >
                    عرض
                  </button>

                  {canEditCase(c) && (
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => navigate(`/cases/${c.id}/edit`)}
                    >
                      تعديل
                    </button>
                  )}

                  {canDeleteCase(c) && (
                    <>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => setConfirmDeleteId(c.id)}
                      >
                        حذف
                      </button>

                      {confirmDeleteId === c.id && (
                        <div className="confirm-overlay">
                          <div className="confirm-box">
                            <p>هل أنت متأكد من حذف هذه القضية؟</p>
                            <div className="confirm-buttons">
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(c.id)}
                              >
                                نعم
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                لا
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            السابق
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show first 2 pages, last 2 pages, and current page with neighbors
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`pagination-button ${
                  currentPage === pageNum ? "active" : ""
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="pagination-ellipsis">...</span>
          )}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => handlePageChange(totalPages)}
              className={`pagination-button ${
                currentPage === totalPages ? "active" : ""
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default Cases;