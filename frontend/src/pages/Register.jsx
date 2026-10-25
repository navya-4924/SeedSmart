import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../components/GoogleLoginButton';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    village: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          village: formData.village
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Registration successful!');
        setTimeout(() => navigate('/login'), 1500);
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
    <div className="farm-bg min-h-screen flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md fade-in">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-green-900/50 mb-3">
            🌾
          </div>
          <h1 className="text-3xl font-bold text-white">SeedSmart</h1>
          <p className="text-green-400 text-sm font-medium mt-1">Join the AI Farming Revolution</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">Start your smart farming journey</p>

          {message && (
            <div className={`p-3 rounded-xl mb-4 text-sm ${
              message.includes('✅') 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-dark"
                placeholder="Ramaiah"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-dark"
                placeholder="farmer@farm.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-dark"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-dark"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-dark"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Village</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="input-dark"
                  placeholder="Kadapa"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : '🌱 Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-green-900/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#14351f] text-gray-500">Or sign up with</span>
            </div>
          </div>

          <GoogleLoginButton />

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-400 font-bold hover:underline">
              Login
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

export default Register;