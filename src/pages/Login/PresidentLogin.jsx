import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import "./Login.css";

export default function PresidentLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("accounts/login/", formData);

      // Check if user is President or General Manager
      const userRole = res.data.user?.role;
      if (userRole !== "President" && userRole !== "GeneralManager") {
        setError("عذراً، هذا النموذج مخصص فقط لرئيس الجامعة أو المدير العام");
        return;
      }

      login(res.data.access, res.data.user);
      navigate("/");
      localStorage.setItem("user", JSON.stringify(res.data.user));
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
          <h1>نظام إدارة الشؤون القانونية</h1>
          <p>
            دخول خاص برئيس الجامعة والمدير العام
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
            <h2>مرحباً بكم</h2>
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
              <div className="form-group" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="myform-control"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    paddingRight: "40px",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "5px",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className={`ri-eye${showPassword ? "-off" : ""}-line`}
                    style={{
                      color: "#6c757d",
                      fontSize: "1.2rem",
                      display: "inline-block",
                      lineHeight: 1,
                    }}
                  ></i>
                </button>
              </div>
            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
            </div>

            <div className="back-to-general-login">
              <Link to="/login">العودة إلى نموذج تسجيل الدخول العام</Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span
                  className="spinner-border"
                  role="status"
                  aria-hidden="true"
                ></span>
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
