import { useState } from 'react';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="logo">WORKLOG</h1>

        <div className="card">
          <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isRegister ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div className="auth-toggle">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(false); }}>
                  Log in
                </a>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(true); }}>
                  Sign up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
