import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
        const data = await response.json();
        
        if (data.valid) {
          setValidToken(true);
          setUserEmail(data.email);
        } else {
          setValidToken(false);
          setMessage(data.message);
        }
      } catch (error) {
        setValidToken(false);
        setMessage('Server error. Please try again.');
      }
    };
    
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match!');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ ' + data.message);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validToken === null) {
    return (
      <div className="farm-bg min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-300">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (validToken === false) {
    return (
      <div className="farm-bg min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md fade-in">
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-400 mb-6 text-sm">
              This password reset link is invalid or has expired.
            </p>
            <Link 
              to="/forgot-password" 
              className="btn-primary inline-block"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Valid token
  return (
    <div className="farm-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-green-900/50 mb-3">
            🔐
          </div>
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-green-400 text-sm font-medium mt-1">
            For: {userEmail}
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-lg font-bold text-white mb-1">Create new password</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your new password must be different from previous ones.
          </p>

          {message && (
            <div className={`p-3 rounded-xl mb-4 text-sm ${
              message.includes('✅') 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-dark"
                placeholder="Re-enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Resetting...' : '🔐 Reset Password'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            <Link to="/login" className="text-green-400 font-bold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 SeedSmart · Kadapa, Andhra Pradesh
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;