import { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setMessage(data.message);
      
      if (response.ok) {
        setEmailSent(true);
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
            🔑
          </div>
          <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
          <p className="text-green-400 text-sm font-medium mt-1">We'll help you reset it</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          
          {message && (
            <div className={`p-3 rounded-xl mb-4 text-sm ${
              message.toLowerCase().includes('sent') || message.includes('✅')
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {message}
            </div>
          )}

          {!emailSent ? (
            <>
              <h2 className="text-lg font-bold text-white mb-1">Reset your password</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter the email associated with your account and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark"
                    placeholder="farmer@farm.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Sending...' : '📧 Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-6xl mb-4">📬</div>
              <h2 className="text-xl font-bold text-white mb-2">Check your inbox!</h2>
              <p className="text-gray-400 text-sm">
                We've sent a password reset link to <br />
                <strong className="text-green-400">{email}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-4">
                ⏰ Link expires in 1 hour
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Don't see it? Check your spam folder.
              </p>
            </div>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            Remember your password?{' '}
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

export default ForgotPassword;