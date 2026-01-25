import React, { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  useGetCasesQuery,
  useDeleteCaseMutation,
  useGetDepartmentsQuery,
} from "../../services/api";
import "./Cases.css";

const ITEMS_PER_PAGE = 8;

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

  // Fetch departments to check if lawyer is in 'القضايا' department
  const { data: departmentsData } = useGetDepartmentsQuery();
  const departments = useMemo(() => {
    if (departmentsData?.results) {
      return departmentsData.results;
    } else if (Array.isArray(departmentsData)) {
      return departmentsData;
    }
    return [];
  }, [departmentsData]);

  // Check if the user is in the 'القضايا' department
  const isInQadaDepartment = useMemo(() => {
    if (!user || user.role !== "Lawyer" || !user.department) return false;

    // If departments haven't loaded yet, return false
    if (!departments || departments.length === 0) {
      return false;
    }

    // Find the department by matching the user's department ID
    const userDept = departments.find((dept) => dept.id === user.department);

    if (!userDept || !userDept.name) {
      return false;
    }

    // Check if the user's department name is 'القضايا' or contains 'قض'
    const deptName = userDept.name.toLowerCase().trim();
    return (
      deptName === "القضايا" || deptName === "قضايا" || deptName.includes("قض")
    );
  }, [user, departments]);

  const [searchTerm, setSearchTerm] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // RTK Query Params
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
      search: searchTerm,
    };
    if (statusFilter !== "all") {
      params.case_status = statusFilter;
    }
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return params;
  }, [currentPage, searchTerm, statusFilter, dateFrom, dateTo]);

  const {
    data: casesResponse,
    isLoading: loading,
    error,
    refetch,
  } = useGetCasesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteCase] = useDeleteCaseMutation();

  // Handle paginated response
  const cases = casesResponse?.results || [];
  const totalCount = casesResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Build notifications from current page data (optimization: don't load all for notifications)
  // Ideally, this should come from a specialized stats endpoint
  const appealNotifications = cases.filter((c) => c.appeal_status === null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, nameFilter, dateFrom, dateTo, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCase(id).unwrap();
      setConfirmDeleteId(null);
      // RTK Query will automatically refetch
    } catch (err) {
      console.error("فشل حذف القضية", err);
      // Optional: show error toast
    }
  };

  const canViewCase = (c) => {
    if (!user) return false;
    if (user.role === "Lawyer") return c.created_by === user.id; // Lawyers can only view cases they created
    if (user.role === "Secretary") return true;
    return ["President", "GeneralManager"].includes(user.role);
  };

  const canEditCase = (c) => {
    if (!user) return false;
    // Only President and General Manager can edit cases
    // Lawyers in 'القضايا' department cannot edit any cases
    return ["President", "GeneralManager"].includes(user.role);
  };

  const canDeleteCase = (c) => {
    if (!user) return false;
    // Only President and General Manager can delete cases
    // Lawyers in 'القضايا' department cannot delete any cases
    return ["President", "GeneralManager"].includes(user.role);
  };

  const canAddCase = () => {
    if (!user) return false;
    if (user.role === "Lawyer") {
      // Only lawyers in 'القضايا' department can add cases
      return isInQadaDepartment;
    }
    if (user.role === "Secretary") return true;
    return ["President", "GeneralManager"].includes(user.role);
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
          ⚠ هناك {appealNotifications.length} قضية في هذه الصفحة لم يتم تحديد
          موقف الطعن لها!
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="بحث بالاسم..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="date-range-filter">
          <input
            type="date"
            placeholder="من التاريخ"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <input
            type="date"
            placeholder="إلى التاريخ"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

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
        <span>إجمالي النتائج: {totalCount}</span>
        <span>
          الصفحة {currentPage} من {totalPages || 1}
        </span>
      </div>

      <div className="cases-grid">
        {cases.filter((caseItem) => {
          // Apply name filter
          const nameMatches =
            !searchTerm ||
            caseItem.plaintiff
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            caseItem.defendant.toLowerCase().includes(searchTerm.toLowerCase());

          // Apply status filter
          const statusMatches =
            statusFilter === "all" || caseItem.case_status === statusFilter;

          // Apply date filter
          const dateReceived = caseItem.date_received
            ? new Date(caseItem.date_received)
            : null;
          const dateFromFilter = dateFrom ? new Date(dateFrom) : null;
          const dateToFilter = dateTo ? new Date(dateTo) : null;

          const dateMatches =
            (!dateFromFilter ||
              (dateReceived && dateReceived >= dateFromFilter)) &&
            (!dateToFilter || (dateReceived && dateReceived <= dateToFilter));

          return nameMatches && statusMatches && dateMatches;
        }).length === 0 ? (
          <div className="empty-state">
            <i className="ri-inbox-line"></i>
            <p>لا توجد قضايا</p>
          </div>
        ) : (
          cases
            .filter((caseItem) => {
              // Apply name filter
              const nameMatches =
                !searchTerm ||
                caseItem.plaintiff
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                caseItem.defendant
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());

              // Apply status filter
              const statusMatches =
                statusFilter === "all" || caseItem.case_status === statusFilter;

              // Apply date filter
              const dateReceived = caseItem.date_received
                ? new Date(caseItem.date_received)
                : null;
              const dateFromFilter = dateFrom ? new Date(dateFrom) : null;
              const dateToFilter = dateTo ? new Date(dateTo) : null;

              const dateMatches =
                (!dateFromFilter ||
                  (dateReceived && dateReceived >= dateFromFilter)) &&
                (!dateToFilter ||
                  (dateReceived && dateReceived <= dateToFilter));

              return nameMatches && statusMatches && dateMatches;
            })
            .map((c) => {
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
                    {canViewCase(c) && (
                      <button
                        className="btn btn-sm btn-view"
                        onClick={() => navigate(`/cases/${c.id}`)}
                      >
                        عرض
                      </button>
                    )}

                    {canEditCase(c) && (
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => navigate(`/cases/${c.id}/edit`)}
                      >
                        تعديل
                      </button>
                    )}

                    {canDeleteCase(c) && (
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => setConfirmDeleteId(c.id)}
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          className="confirm-overlay"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <p>هل أنت متأكد من حذف هذه القضية؟</p>
            <div className="confirm-buttons">
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
              >
                {deletingId === confirmDeleteId ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />{" "}
                    جاري الحذف...
                  </>
                ) : (
                  "نعم"
                )}
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId === confirmDeleteId}
              >
                لا
              </button>
            </div>
          </div>
        </div>
      )}

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
