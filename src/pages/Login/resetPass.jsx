import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import "./Login.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/accounts/password/reset/confirm/", {
        token,
        password: formData.password,
      });

      setMessage(res.data.message || "تم تغيير كلمة المرور بنجاح");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Error resetting password:", err);

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 400) {
          setError(data.message || "الرابط غير صالح أو منتهي الصلاحية");
        } else if (status === 404) {
          setError(data.message || "المستخدم غير موجود");
        } else {
          setError(data.message || "حدث خطأ غير متوقع");
        }
      } else {
        setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقًا");
      }
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

      {/* Right Side - Reset Password Form */}
      <div className="login-form-section">
        <div className="login-container">
          {/* University Logo */}
          <div className="university-logo">
            <img src="/portsaidU.png" alt="جامعة بورسعيد" />
          </div>

          <div className="login-header">
            <h2>إعادة تعيين كلمة المرور</h2>
            <p>الرجاء إدخال كلمة المرور الجديدة</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                كلمة المرور الجديدة <span className="required">*</span>
              </label>
              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="myform-control"
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    paddingRight: '40px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i 
                    className={`ri-eye${showPassword ? '-off' : ''}-line`}
                    style={{
                      color: '#6c757d',
                      fontSize: '1.2rem',
                      display: 'inline-block',
                      lineHeight: 1
                    }}
                  ></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>
                تأكيد كلمة المرور <span className="required">*</span>
              </label>
              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="myform-control"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{
                    paddingRight: '40px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i 
                    className={`ri-eye${showConfirmPassword ? '-off' : ''}-line`}
                    style={{
                      color: '#6c757d',
                      fontSize: '1.2rem',
                      display: 'inline-block',
                      lineHeight: 1
                    }}
                  ></i>
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="spinner-border" role="status" aria-hidden="true"></span>
              ) : (
                <>
                  <i className="ri-refresh-line"></i>
                  <span>تغيير كلمة المرور</span>
                </>
              )}
            </button>

            {message && (
              <div className="success-message">
                <i className="ri-checkbox-circle-line"></i>
                <span>{message}</span>
              </div>
            )}

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
