import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful');
      navigate(redirect);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
      <div className="w-full max-w-md p-8 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
        <h1 className="text-3xl md:text-4xl tracking-tight text-center mb-8" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', fontWeight: 600 }} data-testid="login-title">
          Welcome Back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="mt-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
              data-testid="email-input"
            />
          </div>

          <div>
            <Label htmlFor="password" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
              data-testid="password-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-sm tracking-wide hover:opacity-90"
            style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', transition: 'opacity 0.3s' }}
            data-testid="login-submit-button"
          >
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
            Don't have an account?{' '}
            <Link to="/register" className="hover:opacity-70" style={{ color: '#A18267', transition: 'opacity 0.3s' }} data-testid="register-link">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-8 p-4 rounded-sm" style={{ backgroundColor: '#F0EBE5' }}>
          <p className="text-xs text-center mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Demo Credentials:</p>
          <p className="text-xs text-center" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>
            User: user@candles.com / user123<br />
            Admin: admin@candles.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;