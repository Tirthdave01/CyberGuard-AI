import React, { useState } from 'react';
import { Shield, Lock, User, Mail, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('analyst');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, email, password, role);
      } else {
        await login(username, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user, pass) => {
    setError('');
    setLoading(true);
    try {
      await login(user, pass);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-modal">
        <div className="modal-header">
          <div className="modal-brand">
            <Shield className="brand-icon" size={24} />
            <h3>{isRegister ? 'Register Security Account' : 'CyberGuard AI Portal'}</h3>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="status-banner banner-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={16} />
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    required
                    placeholder="analyst@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assigned Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="analyst">Security Analyst</option>
                  <option value="admin">SOC Administrator</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading}>
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Authenticate & Access'}
          </button>
        </form>

        <div className="auth-switch-text">
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button className="link-button" onClick={() => setIsRegister(false)}>
                Login here
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button className="link-button" onClick={() => setIsRegister(true)}>
                Register here
              </button>
            </span>
          )}
        </div>

        {/* Quick Demo Credentials */}
        <div className="demo-credentials-box">
          <span className="demo-title">Quick Demo Login:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickLogin('admin', 'admin123')}
            >
              Admin (admin / admin123)
            </button>
            <button
              type="button"
              className="btn-demo"
              onClick={() => handleQuickLogin('analyst', 'analyst123')}
            >
              Analyst (analyst / analyst123)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
