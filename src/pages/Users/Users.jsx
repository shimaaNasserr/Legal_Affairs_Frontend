import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  useGetUsersQuery,
  useGetDepartmentsQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeactivateUserMutation,
  useReactivateUserMutation,
} from "../../services/api";
import "./Users.css";
import axiosInstance from "../../apis/axiosInstance";

const Users = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "",
    department: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: departments = [] } = useGetDepartmentsQuery();

  // Fetch all users including deactivated ones
  const {
    data: usersData,
    isLoading,
    error: usersError,
    refetch,
  } = useGetUsersQuery({ show_deactivated: true });

  const [localUsers, setLocalUsers] = useState([]);
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [reactivateUser] = useReactivateUserMutation();

  // Initialize local state when data loads
  useEffect(() => {
    console.log("Fetched usersData:", usersData);
    if (usersData) {
      setLocalUsers(usersData.results || usersData); // fallback if results doesn't exist
    }
  }, [usersData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      role: "",
      department: "",
      password: "",
    });
    setEditingUser(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const submitData = { ...formData };
      if (editingUser && !submitData.password) delete submitData.password;

      if (editingUser) {
        // Create FormData for proper content type handling
        const formData = new FormData();
        Object.keys(submitData).forEach((key) => {
          if (submitData[key] !== null && submitData[key] !== undefined) {
            formData.append(key, submitData[key]);
          }
        });

        // Use direct API call to handle FormData properly
        // Don't set Content-Type header as it's automatically set by browser for FormData
        const response = await axiosInstance.put(
          `accounts/users/${editingUser.id}/`,
          formData
        );
        const updatedUser = response.data;

        // Update local state
        setLocalUsers((prev) =>
          prev.map((user) =>
            user.id === updatedUser.id ? { ...user, ...updatedUser } : user
          )
        );
        setSuccess("تم تحديث المستخدم بنجاح");

        // Refetch users to ensure cache is up-to-date
        refetch();
      } else {
        const newUser = await addUser(submitData).unwrap();
        setLocalUsers((prev) => [...prev, newUser]);
        setSuccess("تم إضافة المستخدم بنجاح");
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("User submit error:", err);
      // Handle different error formats from backend
      let errorMessage = "فشل في حفظ المستخدم";
      if (err.data) {
        if (typeof err.data === "string") {
          errorMessage = err.data;
        } else if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (typeof err.data === "object") {
          // Handle field-specific validation errors
          const fieldErrors = Object.entries(err.data)
            .map(([field, errors]) => {
              const fieldName =
                {
                  username: "اسم المستخدم",
                  email: "البريد الإلكتروني",
                  first_name: "الاسم الأول",
                  last_name: "اسم العائلة",
                  role: "الدور",
                  department: "الإدارة",
                  password: "كلمة المرور",
                }[field] || field;
              const errorText = Array.isArray(errors)
                ? errors.join(", ")
                : errors;
              return `${fieldName}: ${errorText}`;
            })
            .join("\n");
          errorMessage = fieldErrors || errorMessage;
        }
      }
      setError(errorMessage);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role || user.role_name || "",
      department: user.department?.id || user.department || "",
      password: "",
    });
    setShowModal(true);
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm("هل أنت متأكد من تعطيل هذا المستخدم؟")) return;
    try {
      await deactivateUser(userId).unwrap();
      setSuccess("تم تعطيل المستخدم بنجاح");
      // Update local state immediately
      setLocalUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_deactivated: true } : user
        )
      );
    } catch (err) {
      setError(err.data?.detail || "فشل في تعطيل المستخدم");
      console.error(err);
    }
  };

  const handleReactivate = async (userId) => {
    if (!window.confirm("هل أنت متأكد من إعادة تفعيل هذا المستخدم؟")) return;
    try {
      await reactivateUser(userId).unwrap();
      setSuccess("تم إعادة تفعيل المستخدم بنجاح");
      // Update local state immediately
      setLocalUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_deactivated: false } : user
        )
      );
    } catch (err) {
      setError(err.data?.detail || "فشل في إعادة تفعيل المستخدم");
      console.error(err);
    }
  };

  const getDaysRemaining = (deactivatedAt) => {
    if (!deactivatedAt) return null;
    const deactivatedDate = new Date(deactivatedAt);
    const daysLeft =
      15 - Math.floor((new Date() - deactivatedDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const getRoleName = (role) => {
    const roleNames = {
      President: "رئيس الجامعة",
      GeneralManager: "مدير عام",
      DepartmentManager: "مدير إدارة",
      Lawyer: "محامي",
      Secretary: "سكرتير",
    };
    return roleNames[role] || role;
  };

  const activeUsers = localUsers.filter((u) => !u.is_deactivated);
  const inactiveUsers = localUsers.filter((u) => u.is_deactivated);

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div className="users-page">
      {" "}
      <div className="page-header">
        {" "}
        <h2>إدارة المستخدمين</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          إضافة مستخدم جديد{" "}
        </button>{" "}
      </div>
      {(error || usersError) && (
        <div className="alert alert-danger">
          <i className="ri-error-warning-line"></i>
          {error || String(usersError)}
        </div>
      )}
      {success && <div className="alert alert-success">{success}</div>}
      {/* Active Users */}
      <div className="section-header">
        <h3>المستخدمون النشطون</h3>
      </div>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>اسم المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الاسم الكامل</th>
              <th>الدور</th>
              <th>الإدارة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  <div className="empty-state">
                    <i
                      className="ri-user-line"
                      style={{
                        fontSize: "3rem",
                        color: "var(--text-tertiary)",
                        marginBottom: "1rem",
                        display: "block",
                      }}
                    ></i>
                    <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                      لا يوجد مستخدمين
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              activeUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>
                    {user.first_name} {user.last_name}
                  </td>
                  <td>{getRoleName(user.role)}</td>
                  <td>{user.department?.name || "-"}</td>
                  <td>
                    <div className="actions">
                      <button
                        className={`btn btn-sm ${
                          !user.is_active ? "btn-success" : "btn-danger"
                        }`}
                        onClick={() =>
                          !user.is_active
                            ? handleReactivate(user.id)
                            : handleDeactivate(user.id)
                        }
                      >
                        <i
                          className={
                            !user.is_active
                              ? "ri-user-follow-line"
                              : "ri-user-unfollow-line"
                          }
                        ></i>{" "}
                        {!user.is_active ? "إعادة تنشيط المستخدم" : "تعطيل"}
                      </button>
                      {!!user.is_active && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(user)}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Inactive Users */}
      {inactiveUsers.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: "2rem" }}>
            <h3>المستخدمون المعطلون</h3>
          </div>
          <div className="users-table-container">
            <table className="users-table" style={{ opacity: 0.8 }}>
              <thead>
                <tr>
                  <th>اسم المستخدم</th>
                  <th>البريد الإلكتروني</th>
                  <th>الدور</th>
                  <th>متبقي</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {inactiveUsers.map((user) => {
                  const daysLeft = getDaysRemaining(user.deactivated_at);
                  return (
                    <tr key={user.id} className="inactive-user">
                      <td>{user.username || "-"}</td>
                      <td>{user.email || "-"}</td>
                      <td>{getRoleName(user.role)}</td>
                      <td>
                        {daysLeft !== null ? `${daysLeft} يوم` : "غير معروف"}
                      </td>
                      <td>
                        {(currentUser?.role === "President" ||
                          currentUser?.role === "GeneralManager") && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleReactivate(user.id)}
                          >
                            <i className="ri-user-follow-line"></i> إعادة تفعيل
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>اسم المستخدم</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>الاسم الأول</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>اسم العائلة</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>الدور</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">اختر الدور</option>
                  <option value="President">رئيس الجامعة</option>
                  <option value="GeneralManager">مدير عام</option>
                  <option value="DepartmentManager">مدير إدارة</option>
                  <option value="Lawyer">محامي</option>
                  <option value="Secretary">سكرتير</option>
                </select>
              </div>
              <div className="form-group">
                <label>الإدارة</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">اختر الإدارة (اختياري)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  كلمة المرور{" "}
                  {editingUser && "(اتركه فارغاً إذا لم ترد تغييره)"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingUser ? "تحديث" : "إضافة"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
