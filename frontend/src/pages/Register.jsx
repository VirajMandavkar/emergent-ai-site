import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      toast.success('Registration successful');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
      <div className="w-full max-w-md p-8 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
        <h1 className="text-3xl md:text-4xl tracking-tight text-center mb-8" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', fontWeight: 600 }} data-testid="register-title">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="mt-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
              data-testid="name-input"
            />
          </div>

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

          <div>
            <Label htmlFor="confirmPassword" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
              data-testid="confirm-password-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-sm tracking-wide hover:opacity-90"
            style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', transition: 'opacity 0.3s' }}
            data-testid="register-submit-button"
          >
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
            Already have an account?{' '}
            <Link to="/login" className="hover:opacity-70" style={{ color: '#A18267', transition: 'opacity 0.3s' }} data-testid="login-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;