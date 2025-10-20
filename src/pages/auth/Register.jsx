import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("accounts/register/", formData);
      login(res.data.access, res.data.user);
      navigate("/users");
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء التسجيل، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-icon">
          <svg viewBox="0 0 64 64" width="70" height="70" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="#304771" />
            <g fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <line x1="32" y1="15" x2="32" y2="45" />
              <line x1="22" y1="45" x2="42" y2="45" />
              <line x1="20" y1="20" x2="44" y2="20" />
              <line x1="24" y1="20" x2="20" y2="30" />
              <line x1="40" y1="20" x2="44" y2="30" />
              <ellipse cx="20" cy="32" rx="5" ry="2" stroke="white" fill="none" />
              <ellipse cx="44" cy="32" rx="5" ry="2" stroke="white" fill="none" />
            </g>
          </svg>
        </div>

        <h2 className="login-title">إنشاء حساب جديد</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input type="text" name="username" className="myform-control" placeholder="اسم المستخدم" value={formData.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="email" name="email" className="myform-control" placeholder="البريد الإلكتروني" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="text" name="first_name" className="myform-control" placeholder="الاسم الأول" value={formData.first_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="text" name="last_name" className="myform-control" placeholder="اسم العائلة" value={formData.last_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <input type="password" name="password" className="myform-control" placeholder="كلمة المرور" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="mybtn login-btn btn-block" disabled={loading}>
            {loading ? <span className="spinner"></span> : "إنشاء الحساب"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}
