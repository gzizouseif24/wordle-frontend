import React, { useState } from 'react';
import './AuthModal.css';
import config from '../config';

function AuthModal({ onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body = isLogin 
        ? { login: username, password } 
        : { username, email, password };

      const response = await fetch(`${config.API_URL}/api/users${isLogin ? '/login' : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ ما');
      }

      // Save token to localStorage
      localStorage.setItem('wordleToken', data.token);
      localStorage.setItem('wordleUser', JSON.stringify({
        id: data._id,
        username: data.username,
        email: data.email
      }));

      setLoading(false);
      // Notify parent component about successful login
      onLogin(data);
      onClose();
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-modal-title">
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              {isLogin ? 'اسم المستخدم أو البريد الإلكتروني' : 'اسم المستخدم'}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'جاري التحميل...' : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </button>
        </form>
        
        <div className="auth-toggle">
          <button onClick={toggleMode} className="auth-toggle-btn" disabled={loading}>
            {isLogin ? 'إنشاء حساب جديد' : 'العودة لتسجيل الدخول'}
          </button>
        </div>
        
        <button onClick={onClose} className="auth-close-btn">
          إغلاق
        </button>
      </div>
    </div>
  );
}

export default AuthModal; 