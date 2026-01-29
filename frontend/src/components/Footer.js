import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t mt-24" style={{ borderColor: '#E5E0D8', backgroundColor: '#F9F8F6' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', fontWeight: 600 }}>
              Luminaire
            </h3>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
              Handcrafted candles that illuminate your space with warmth and elegance.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm tracking-wide mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
              SHOP
            </h4>
            <ul className="space-y-2">
              <li><Link to="/shop?category=Scented" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Scented Candles</Link></li>
              <li><Link to="/shop?category=Unscented" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Unscented Candles</Link></li>
              <li><Link to="/shop?category=Decorative" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Decorative Candles</Link></li>
              <li><Link to="/shop?category=Gift Sets" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Gift Sets</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm tracking-wide mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
              HELP
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Contact Us</a></li>
              <li><a href="#" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Shipping & Returns</a></li>
              <li><a href="#" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>FAQ</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm tracking-wide mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
              ABOUT
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Our Story</a></li>
              <li><a href="#" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Sustainability</a></li>
              <li><a href="#" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C', transition: 'opacity 0.3s' }}>Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: '#E5E0D8' }}>
          <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
            © 2025 Luminaire. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};