import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const res = await axiosInstance.post("accounts/login/", formData);
      login(res.data.access, res.data.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Image with Overlay */}
      <div className="login-image-section">
        <div className="login-image-content">
          <div className="login-image-icon">
            <i className="ri-scales-3-fill"></i>
          </div>
          <h1>إدارة الشؤون القانونية</h1>
          <p>
            نظام شامل ومتكامل لإدارة القضايا والتحقيقات والتظلمات والعقود والفتاوى
            <br />
            جامعة بورسعيد
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-container">
          {/* University Logo */}
          <div className="university-logo">
            <img src="/portsaidU.png" alt="جامعة بورسعيد" />
          </div>

          <div className="login-header">
            <h2>مرحباً بعودتك!</h2>
            <p>يرجى إدخال بياناتك للدخول إلى النظام</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                البريد الإلكتروني <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <i className="ri-mail-line"></i>
                <input
                  type="email"
                  name="email"
                  className="myform-control"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                كلمة المرور <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="password"
                  name="password"
                  className="myform-control"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="forgot-password">
              <a href="#" onClick={(e) => { e.preventDefault(); }}>
                نسيت كلمة المرور؟
              </a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="spinner-border" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <i className="ri-login-box-line"></i>
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>

            {error && (
              <div className="error-message">
                <i className="ri-error-warning-line"></i>
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
