import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartProducts();
  }, [cart]);

  const fetchCartProducts = async () => {
    try {
      setLoading(true);
      const productPromises = cart.map(item =>
        axios.get(`${API}/products/${item.productId}`)
      );
      const responses = await Promise.all(productPromises);
      const products = responses.map((res, index) => ({
        ...res.data,
        cartQuantity: cart[index].quantity
      }));
      setCartProducts(products);
    } catch (error) {
      console.error('Error fetching cart products:', error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartProducts.reduce((sum, product) => sum + (product.price * product.cartQuantity), 0);
  const shipping = subtotal > 0 ? 50 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#A18267' }}></div>
          <p className="mt-4" style={{ color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
        <div className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="empty-cart-title">Your Cart is Empty</h2>
          <p className="text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Start adding some beautiful candles to your cart</p>
          <Link to="/shop">
            <Button className="text-sm tracking-wide px-8 py-6" style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }} data-testid="continue-shopping-button">CONTINUE SHOPPING</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F9F8F6' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <h1 className="text-4xl md:text-5xl tracking-tight mb-12" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="cart-title">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartProducts.map(product => (
              <div key={product.id} className="flex gap-6 p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="cart-item">
                <Link to={`/product/${product.id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-sm overflow-hidden" style={{ backgroundColor: '#F0EBE5' }}>
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" data-testid="cart-item-image" />
                  </div>
                </Link>

                <div className="flex-grow">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg mb-1 hover:opacity-70" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', transition: 'opacity 0.3s' }} data-testid="cart-item-name">{product.name}</h3>
                  </Link>
                  <p className="text-sm mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="cart-item-category">{product.category}</p>
                  <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }} data-testid="cart-item-price">₹{product.price}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="hover:opacity-70"
                    style={{ color: '#2D241B', transition: 'opacity 0.3s' }}
                    data-testid="remove-item-button"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="flex items-center border rounded-sm" style={{ borderColor: '#E5E0D8' }}>
                    <button
                      onClick={() => updateQuantity(product.id, product.cartQuantity - 1)}
                      className="px-3 py-1 hover:opacity-70"
                      style={{ color: '#2D241B', transition: 'opacity 0.3s' }}
                      data-testid="decrease-quantity-button"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 border-x text-sm" style={{ borderColor: '#E5E0D8', color: '#2D241B', fontFamily: 'Manrope, sans-serif' }} data-testid="cart-item-quantity">{product.cartQuantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, product.cartQuantity + 1)}
                      className="px-3 py-1 hover:opacity-70"
                      style={{ color: '#2D241B', transition: 'opacity 0.3s' }}
                      data-testid="increase-quantity-button"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="p-8 rounded-sm sticky top-24" style={{ backgroundColor: '#F0EBE5' }}>
              <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="order-summary-title">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>
                  <span>Shipping</span>
                  <span data-testid="cart-shipping">₹{shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4" style={{ borderColor: '#E5E0D8' }}>
                  <div className="flex justify-between text-xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
                    <span>Total</span>
                    <span data-testid="cart-total">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full py-6 text-sm tracking-wide hover:opacity-90"
                style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', transition: 'opacity 0.3s' }}
                data-testid="checkout-button"
              >
                PROCEED TO CHECKOUT
              </Button>

              <Link to="/shop">
                <Button
                  variant="outline"
                  className="w-full mt-4 py-6 text-sm tracking-wide"
                  style={{ borderColor: '#E5E0D8', color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}
                  data-testid="continue-shopping-link"
                >
                  CONTINUE SHOPPING
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;