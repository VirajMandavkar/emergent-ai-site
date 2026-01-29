import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);

      // Fetch related products
      const relatedRes = await axios.get(`${API}/products?category=${response.data.category}&limit=4`);
      setRelatedProducts(relatedRes.data.filter(p => p.id !== id).slice(0, 3));
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(id, quantity);
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`);
  };

  const handleAddRelatedToCart = (productId) => {
    addToCart(productId, 1);
    toast.success('Added to cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#A18267' }}></div>
          <p className="mt-4" style={{ color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
        <div className="text-center space-y-4">
          <h2 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }}>Product not found</h2>
          <Link to="/shop">
            <Button style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F9F8F6' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
          <Link to="/" className="hover:opacity-70">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:opacity-70">Shop</Link>
          <span className="mx-2">/</span>
          <span style={{ color: '#2D241B' }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative rounded-sm overflow-hidden" style={{ paddingBottom: '100%', backgroundColor: '#F0EBE5' }}>
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                data-testid="product-main-image"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className="relative rounded-sm overflow-hidden"
                  style={{ paddingBottom: '100%', backgroundColor: '#F0EBE5', border: selectedImage === index ? '2px solid #A18267' : 'none' }}
                  data-testid={`product-thumbnail-${index}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm tracking-wide mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="product-category">{product.category}</p>
              <h1 className="text-4xl md:text-5xl tracking-tight mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', fontWeight: 600 }} data-testid="product-title">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(product.rating) ? '#A18267' : 'none'}
                      style={{ color: '#A18267' }}
                    />
                  ))}
                </div>
                <span className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="product-reviews">
                  ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }} data-testid="product-price">₹{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl line-through" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="product-original-price">₹{product.originalPrice}</span>
                )}
              </div>
            </div>

            <div className="py-6 border-t border-b" style={{ borderColor: '#E5E0D8' }}>
              <p className="text-base leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} data-testid="product-description">{product.description}</p>
            </div>

            {/* Product Info */}
            <div className="space-y-3 text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
              <div className="flex justify-between">
                <span>SKU:</span>
                <span style={{ color: '#2D241B' }} data-testid="product-sku">{product.sku}</span>
              </div>
              {product.fragrance && (
                <div className="flex justify-between">
                  <span>Fragrance:</span>
                  <span style={{ color: '#2D241B' }} data-testid="product-fragrance">{product.fragrance}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Size:</span>
                <span style={{ color: '#2D241B' }} data-testid="product-size">{product.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Weight:</span>
                <span style={{ color: '#2D241B' }} data-testid="product-weight">{product.weight}</span>
              </div>
              <div className="flex justify-between">
                <span>Burn Time:</span>
                <span style={{ color: '#2D241B' }} data-testid="product-burn-time">{product.burnTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Stock:</span>
                <span style={{ color: product.stock > 0 ? '#A18267' : '#2D241B' }} data-testid="product-stock">
                  {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Quantity:</span>
                  <div className="flex items-center border rounded-sm" style={{ borderColor: '#E5E0D8' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:opacity-70"
                      style={{ color: '#2D241B', transition: 'opacity 0.3s' }}
                      data-testid="decrease-quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 border-x" style={{ borderColor: '#E5E0D8', color: '#2D241B', fontFamily: 'Manrope, sans-serif' }} data-testid="quantity-value">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:opacity-70"
                      style={{ color: '#2D241B', transition: 'opacity 0.3s' }}
                      data-testid="increase-quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full py-6 text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', transition: 'opacity 0.3s' }}
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart size={20} />
                  ADD TO CART
                </Button>
              </div>
            )}

            {product.stock === 0 && (
              <div className="py-4 px-6 rounded-sm text-center" style={{ backgroundColor: '#F0EBE5' }}>
                <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} data-testid="out-of-stock-message">This product is currently out of stock</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-4xl md:text-5xl tracking-tight mb-12" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="related-products-title">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} onAddToCart={handleAddRelatedToCart} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;