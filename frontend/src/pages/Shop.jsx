import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { Filter, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 2500]);
  const { addToCart } = useCart();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, category, search, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products?limit=50`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(filtered);
  };

  const handleSort = (value) => {
    let sorted = [...filteredProducts];
    switch (value) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    setFilteredProducts(sorted);
  };

  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
    toast.success('Added to cart');
  };

  const categories = ['Scented', 'Unscented', 'Decorative', 'Gift Sets', 'Eco-Friendly'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#A18267' }}></div>
          <p className="mt-4" style={{ color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F9F8F6' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl tracking-tight mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="shop-title">
            {category || search ? (category || `Search: ${search}`) : 'All Candles'}
          </h1>
          <p className="text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="product-count">
            {filteredProducts.length} products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 mb-4 w-full justify-between px-4 py-2 rounded-sm"
              style={{ backgroundColor: '#E5E0D8', color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}
              data-testid="toggle-filters-button"
            >
              <span className="flex items-center gap-2">
                <Filter size={16} />
                FILTERS
              </span>
              <ChevronDown size={16} className={showFilters ? 'rotate-180' : ''} style={{ transition: 'transform 0.3s' }} />
            </button>

            <div className={`space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
              {/* Categories */}
              <div>
                <h3 className="text-sm tracking-wide mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>CATEGORY</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSearchParams({})}
                    className={`block text-sm w-full text-left hover:opacity-70 ${!category ? 'font-medium' : ''}`}
                    style={{ fontFamily: 'Manrope, sans-serif', color: !category ? '#A18267' : '#8C847C', transition: 'opacity 0.3s' }}
                    data-testid="category-all"
                  >
                    All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSearchParams({ category: cat })}
                      className={`block text-sm w-full text-left hover:opacity-70 ${category === cat ? 'font-medium' : ''}`}
                      style={{ fontFamily: 'Manrope, sans-serif', color: category === cat ? '#A18267' : '#8C847C', transition: 'opacity 0.3s' }}
                      data-testid={`category-${cat.toLowerCase().replace(' ', '-')}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm tracking-wide mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>PRICE RANGE</h3>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={2500}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                    data-testid="price-range-slider"
                  />
                  <div className="flex justify-between text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                    <span data-testid="price-range-min">₹{priceRange[0]}</span>
                    <span data-testid="price-range-max">₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {/* Sort */}
            <div className="flex justify-end mb-8">
              <Select onValueChange={handleSort}>
                <SelectTrigger className="w-48" style={{ fontFamily: 'Manrope, sans-serif' }} data-testid="sort-select">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="no-products-message">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;