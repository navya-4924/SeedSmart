import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('✅ Login successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="farm-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-green-900/50 mb-3">
            🌾
          </div>
          <h1 className="text-3xl font-bold text-white">SeedSmart</h1>
          <p className="text-green-400 text-sm font-medium mt-1">AI-Powered Farming Assistant</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-sm mb-6">Login to continue to your dashboard</p>

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
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
                placeholder="farmer@farm.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-green-400 hover:text-green-300 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Logging in...' : '🔐 Login'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-green-900/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#14351f] text-gray-500">Or continue with</span>
            </div>
          </div>

          <GoogleLoginButton />

          <p className="text-center text-gray-400 text-sm mt-6">
            New here?{' '}
            <Link to="/register" className="text-green-400 font-bold hover:underline">
              Create Account
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

export default Login;