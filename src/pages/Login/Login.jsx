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
      localStorage.setItem("user", JSON.stringify(response.data.user));

    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-icon">
          <svg
            viewBox="0 0 64 64"
            width="70"
            height="70"
            xmlns="http://www.w3.org/2000/svg"
          >
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

        <h2 className="login-title">إدارة الشؤون القانونية</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              className="myform-control"
              placeholder="البريد الإلكتروني"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              className="myform-control"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="mybtn login-btn btn-block" disabled={loading}>
            {loading ?     <span
      className="spinner-border spinner-border-sm"
      role="status"
      aria-hidden="true"
    ></span> : "تسجيل الدخول"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}
