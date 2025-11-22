import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Register.css";

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
      {/* Left Side - Image with Overlay */}
      <div className="login-image-section">
        <div className="login-image-content">
          <div className="login-image-icon">
            <i className="ri-user-add-fill"></i>
          </div>
          <h1>إدارة الشؤون القانونية</h1>
          <p>
            نظام شامل ومتكامل لإدارة القضايا والتحقيقات والتظلمات والعقود والفتاوى
            <br />
            جامعة بورسعيد
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="login-form-section">
        <div className="login-container">
          {/* University Logo */}
          <div className="university-logo">
            <img src="/portsaidU.png" alt="جامعة بورسعيد" />
          </div>

          <div className="login-header">
            <h2>إنشاء حساب جديد</h2>
            <p>يرجى إدخال بياناتك لإنشاء حساب جديد في النظام</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                اسم المستخدم <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <i className="ri-user-line"></i>
                <input
                  type="text"
                  name="username"
                  className="myform-control"
                  placeholder="أدخل اسم المستخدم"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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

            <div className="form-row">
              <div className="form-group">
                <label>
                  الاسم الأول <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <i className="ri-user-3-line"></i>
                  <input
                    type="text"
                    name="first_name"
                    className="myform-control"
                    placeholder="الاسم الأول"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  اسم العائلة <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <i className="ri-user-3-line"></i>
                  <input
                    type="text"
                    name="last_name"
                    className="myform-control"
                    placeholder="اسم العائلة"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                كلمة المرور <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="myform-control"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowPassword(true)}
                  onBlur={() => setShowPassword(false)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="spinner-border" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <i className="ri-user-add-line"></i>
                  <span>إنشاء الحساب</span>
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
