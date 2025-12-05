import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../apis/axiosInstance';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post('accounts/password/reset/', { email });
      setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setShowResetForm(true);
    } catch (error) {
      setMessage('حدث خطأ. يرجى المحاولة مرة أخرى.');
      console.error('Error sending reset email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.post('accounts/password/reset/confirm/', {
        email,
        new_password1: newPassword,
        new_password2: confirmPassword,
      });
      setMessage('تم تغيير كلمة المرور بنجاح');
      // Redirect to login after successful password reset
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setMessage('حدث خطأ. يرجى المحاولة مرة أخرى.');
      console.error('Error resetting password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axiosInstance.post('accounts/google/', {
        access_token: response.credential,
      });
      // Handle successful Google login
      console.log('Google login successful', res.data);
      window.location.href = '/';
    } catch (error) {
      setMessage('فشل تسجيل الدخول باستخدام جوجل');
      console.error('Google login error:', error);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    setMessage('فشل تسجيل الدخول باستخدام جوجل');
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>إعادة تعيين كلمة المرور</h2>
        
        {!showResetForm ? (
          <>
            <p>أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور</p>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  required
                  className="form-control"
                />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'جاري الإرسال...' : 'إرسال الرابط'}
              </button>
            </form>
            
            <div className="divider">أو</div>
            
            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                useOneTap
                auto_select
                locale="ar"
                text="signin_with"
                size="large"
                width="300"
              />
            </div>
          </>
        ) : (
          <form onSubmit={handleResetPassword} className="reset-password-form">
            <div className="form-group">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                required
                className="form-control"
                minLength="8"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تأكيد كلمة المرور"
                required
                className="form-control"
                minLength="8"
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
            </button>
          </form>
        )}
        
        {message && <div className="alert alert-info">{message}</div>}
        
        <div className="back-to-login">
          <Link to="/login">العودة إلى تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
