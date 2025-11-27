import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Users.css";

const Users = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("departments/");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setError("");
      const res = await axiosInstance.get("accounts/users/");
      // ViewSet returns data in results array if paginated, or directly as array
      const usersData = res.data.results || res.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || "فشل في تحميل المستخدمين";
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const submitData = { ...formData };
      
      // تحويل role من اسم إلى ID
      if (submitData.role) {
        try {
          const rolesRes = await axiosInstance.get("accounts/roles/");
          const role = rolesRes.data.find(r => r.name === submitData.role);
          if (role) {
            submitData.role_id = role.id;
            delete submitData.role;
          }
        } catch (err) {
          console.error("Error fetching roles:", err);
        }
      }

      if (editingUser) {
        // تحديث مستخدم موجود
        if (!submitData.password) delete submitData.password;
        await axiosInstance.put(`accounts/users/${editingUser.id}/`, submitData);
      } else {
        // إضافة مستخدم جديد
        await axiosInstance.post("accounts/users/", submitData);
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.response?.data?.message || "فشل في حفظ المستخدم");
    }
  };

  const handleEdit = async (user) => {
    setEditingUser(user);
    
    // جلب تفاصيل المستخدم الكاملة
    try {
      const res = await axiosInstance.get(`accounts/users/${user.id}/`);
      const userData = res.data;
      setFormData({
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        department: userData.department || "",
        password: "",
      });
    } catch (err) {
      // في حالة الخطأ، استخدام البيانات المتاحة
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        department: user.department || "",
        password: "",
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      await axiosInstance.delete(`accounts/users/${userId}/`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("فشل في حذف المستخدم");
    }
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

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>إدارة المستخدمين</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="ri-add-circle-line"></i> إضافة مستخدم جديد
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="ri-error-warning-line"></i>
          {error}
        </div>
      )}

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
            {users.length === 0 && !loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div className="empty-state">
                    <i className="ri-user-line" style={{fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '1rem', display: 'block'}}></i>
                    <p style={{color: 'var(--text-secondary)', margin: 0}}>لا يوجد مستخدمين</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>
                    {user.first_name || ""} {user.last_name || ""}
                  </td>
                  <td>{getRoleName(user.role || user.role_name)}</td>
                  <td>{user.department_name || (user.department?.name) || user.department || "-"}</td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        <i className="ri-pencil-line"></i> تعديل
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          className="btn btn-sm btn-delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="ri-delete-bin-line"></i> حذف
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}</h3>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
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
                  كلمة المرور {editingUser && "(اتركه فارغاً إذا لم ترد تغييره)"}
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

