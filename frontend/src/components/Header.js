import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

export const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(249, 248, 246, 0.8)' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', fontWeight: 600 }}>
              Luminaire
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm tracking-wide hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', transition: 'opacity 0.3s' }}>
              HOME
            </Link>
            <Link to="/shop" className="text-sm tracking-wide hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', transition: 'opacity 0.3s' }}>
              SHOP
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm tracking-wide hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#A18267', transition: 'opacity 0.3s' }}>
                ADMIN
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:opacity-70"
              style={{ color: '#2D241B', transition: 'opacity 0.3s' }}
              data-testid="search-button"
            >
              <Search size={20} />
            </button>

            <Link to="/cart" className="relative hover:opacity-70" style={{ color: '#2D241B', transition: 'opacity 0.3s' }} data-testid="cart-link">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#A18267', color: '#FFFFFF' }}
                  data-testid="cart-count"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="hover:opacity-70" style={{ color: '#2D241B', transition: 'opacity 0.3s' }} data-testid="dashboard-link">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="hover:opacity-70" style={{ color: '#2D241B', transition: 'opacity 0.3s' }} data-testid="logout-button">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="text-sm tracking-wide" style={{ backgroundColor: '#A18267', color: '#FFFFFF' }} data-testid="login-button">
                  LOGIN
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: '#2D241B' }}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search candles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-sm focus:outline-none"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', color: '#2D241B' }}
                autoFocus
                data-testid="search-input"
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t" style={{ borderColor: '#E5E0D8', backgroundColor: '#F9F8F6' }}>
          <nav className="px-6 py-4 space-y-4">
            <Link to="/" className="block text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} onClick={() => setMobileMenuOpen(false)}>
              HOME
            </Link>
            <Link to="/shop" className="block text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} onClick={() => setMobileMenuOpen(false)}>
              SHOP
            </Link>
            <Link to="/cart" className="block text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} onClick={() => setMobileMenuOpen(false)}>
              CART ({cartCount})
            </Link>
            {isAdmin && (
              <Link to="/admin" className="block text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#A18267' }} onClick={() => setMobileMenuOpen(false)}>
                ADMIN
              </Link>
            )}
            {user ? (
              <>
                <Link to="/dashboard" className="block text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} onClick={() => setMobileMenuOpen(false)}>
                  MY ACCOUNT
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>
                  LOGOUT
                </button>
              </>
            ) : (
              <Link to="/login" className="block text-sm tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} onClick={() => setMobileMenuOpen(false)}>
                LOGIN
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};