import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featuredRes, allRes] = await Promise.all([
        axios.get(`${API}/products?featured=true&limit=4`),
        axios.get(`${API}/products?limit=8`)
      ]);
      setFeaturedProducts(featuredRes.data);
      setBestSellers(allRes.data.sort((a, b) => b.reviews - a.reviews).slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
    toast.success('Added to cart');
  };

  return (
    <div style={{ backgroundColor: '#F9F8F6' }}>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-6">
              <h1 className="text-5xl md:text-7xl tracking-tight leading-none" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', fontWeight: 600 }} data-testid="hero-title">
                Illuminate Your Space
              </h1>
              <p className="text-base md:text-lg leading-relaxed tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="hero-description">
                Discover our collection of handcrafted candles, each one carefully made to bring warmth and elegance to your home.
              </p>
              <Link to="/shop">
                <Button className="text-sm tracking-wide px-8 py-6 flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', transition: 'opacity 0.3s' }} data-testid="shop-now-button">
                  SHOP NOW <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="md:col-span-7">
              <div className="relative rounded-sm overflow-hidden" style={{ paddingBottom: '75%', backgroundColor: '#F0EBE5' }}>
                <img
                  src="https://images.unsplash.com/photo-1553444892-20174939d7bb?w=1200"
                  alt="Cozy candle setting"
                  className="absolute inset-0 w-full h-full object-cover"
                  data-testid="hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 md:py-32" style={{ backgroundColor: '#F0EBE5' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl tracking-tight text-center mb-16" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="categories-title">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Scented', image: 'https://images.unsplash.com/photo-1627808587525-194446b07384?w=400' },
              { name: 'Unscented', image: 'https://images.unsplash.com/photo-1602874801138-3190c0c2e9cd?w=400' },
              { name: 'Decorative', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400' },
              { name: 'Gift Sets', image: 'https://images.unsplash.com/photo-1721274500738-f6e549c7d5fc?w=400' }
            ].map(category => (
              <Link key={category.name} to={`/shop?category=${category.name}`} className="group" data-testid={`category-${category.name.toLowerCase().replace(' ', '-')}`}>
                <div className="relative rounded-sm overflow-hidden mb-4" style={{ paddingBottom: '100%', backgroundColor: '#FFFFFF' }}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105"
                    style={{ transition: 'transform 0.5s ease-out' }}
                  />
                </div>
                <h3 className="text-lg text-center tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-4xl md:text-5xl tracking-tight text-center mb-16" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="featured-title">
            Featured Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 md:py-32" style={{ backgroundColor: '#F0EBE5' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-center gap-2 mb-16">
            <Star size={20} style={{ color: '#A18267' }} fill="#A18267" />
            <h2 className="text-4xl md:text-5xl tracking-tight text-center" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="bestsellers-title">
              Best Sellers
            </h2>
            <Star size={20} style={{ color: '#A18267' }} fill="#A18267" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-6">
          <h2 className="text-4xl md:text-5xl tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', fontWeight: 600 }} data-testid="cta-title">
            Find Your Perfect Scent
          </h2>
          <p className="text-base md:text-lg leading-relaxed tracking-wide" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
            Explore our full collection of handcrafted candles and discover the perfect ambiance for your space.
          </p>
          <Link to="/shop">
            <Button className="text-sm tracking-wide px-8 py-6 hover:opacity-90" style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', transition: 'opacity 0.3s' }} data-testid="browse-collection-button">
              BROWSE COLLECTION
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;