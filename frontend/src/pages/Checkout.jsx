import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [shippingData, setShippingData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: ''
  });

  const [upiId, setUpiId] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [countdown, setCountdown] = useState(120);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
    fetchCartProducts();
  }, [user, cart]);

  useEffect(() => {
    if (step === 3 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const fetchCartProducts = async () => {
    try {
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
    }
  };

  const subtotal = cartProducts.reduce((sum, product) => sum + (product.price * product.cartQuantity), 0);
  const shipping = 50;
  const total = subtotal + shipping;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleReviewSubmit = () => {
    setStep(3);
  };

  const validateUpiId = (id) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    return upiRegex.test(id);
  };

  const handlePaymentSubmit = async () => {
    if (!validateUpiId(upiId)) {
      toast.error('Invalid UPI ID format');
      return;
    }

    setPaymentProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      // 90% success rate
      const success = Math.random() < 0.9;

      if (success) {
        try {
          const orderData = {
            items: cart,
            shippingAddress: shippingData,
            subtotal,
            shipping,
            total,
            paymentMethod: 'UPI',
            upiId
          };

          const response = await axios.post(`${API}/orders`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
          });

          clearCart();
          toast.success('Payment successful!');
          navigate(`/order-confirmation/${response.data.orderId}`);
        } catch (error) {
          toast.error('Order creation failed');
          console.error(error);
        }
      } else {
        toast.error('Payment failed. Please try again.');
      }

      setPaymentProcessing(false);
    }, 3000);
  };

  return (
    <div style={{ backgroundColor: '#F9F8F6' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <h1 className="text-4xl md:text-5xl tracking-tight mb-12" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="checkout-title">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${step >= num ? 'bg-opacity-100' : 'bg-opacity-30'}`}
                style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
                data-testid={`step-${num}`}
              >
                {step > num ? <CheckCircle2 size={20} /> : num}
              </div>
              {num < 3 && (
                <div className="w-24 h-0.5 mx-2" style={{ backgroundColor: step > num ? '#A18267' : '#E5E0D8' }}></div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Info */}
            {step === 1 && (
              <form onSubmit={handleShippingSubmit} className="space-y-6 p-8 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
                <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="shipping-info-title">Shipping Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingData.fullName}
                      onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                      required
                      className="mt-2"
                      data-testid="full-name-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                      required
                      className="mt-2"
                      data-testid="email-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="phone" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      required
                      placeholder="+91-9876543210"
                      className="mt-2"
                      data-testid="phone-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine1" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      value={shippingData.addressLine1}
                      onChange={(e) => setShippingData({ ...shippingData, addressLine1: e.target.value })}
                      required
                      className="mt-2"
                      data-testid="address-line1-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="addressLine2" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      value={shippingData.addressLine2}
                      onChange={(e) => setShippingData({ ...shippingData, addressLine2: e.target.value })}
                      className="mt-2"
                      data-testid="address-line2-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>City</Label>
                    <Input
                      id="city"
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      required
                      className="mt-2"
                      data-testid="city-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>State</Label>
                    <Input
                      id="state"
                      value={shippingData.state}
                      onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                      required
                      className="mt-2"
                      data-testid="state-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="pinCode" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>PIN Code</Label>
                    <Input
                      id="pinCode"
                      value={shippingData.pinCode}
                      onChange={(e) => setShippingData({ ...shippingData, pinCode: e.target.value })}
                      required
                      placeholder="123456"
                      className="mt-2"
                      data-testid="pin-code-input"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-sm tracking-wide"
                  style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
                  data-testid="continue-to-review-button"
                >
                  CONTINUE TO REVIEW
                </Button>
              </form>
            )}

            {/* Step 2: Review Order */}
            {step === 2 && (
              <div className="space-y-6 p-8 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
                <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="review-order-title">Review Your Order</h2>

                <div className="space-y-4">
                  <h3 className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>Shipping Address</h3>
                  <div className="text-sm space-y-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                    <p data-testid="review-name">{shippingData.fullName}</p>
                    <p data-testid="review-address">{shippingData.addressLine1}</p>
                    {shippingData.addressLine2 && <p>{shippingData.addressLine2}</p>}
                    <p>{shippingData.city}, {shippingData.state} {shippingData.pinCode}</p>
                    <p data-testid="review-phone">{shippingData.phone}</p>
                    <p data-testid="review-email">{shippingData.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="text-sm"
                    style={{ borderColor: '#E5E0D8', color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}
                    data-testid="edit-address-button"
                  >
                    Edit Address
                  </Button>
                </div>

                <div className="border-t pt-6" style={{ borderColor: '#E5E0D8' }}>
                  <h3 className="text-lg mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>Order Items</h3>
                  <div className="space-y-4">
                    {cartProducts.map(product => (
                      <div key={product.id} className="flex gap-4" data-testid="review-order-item">
                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-sm" />
                        <div className="flex-grow">
                          <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>{product.name}</p>
                          <p className="text-xs" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Qty: {product.cartQuantity}</p>
                        </div>
                        <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>₹{product.price * product.cartQuantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleReviewSubmit}
                  className="w-full py-6 text-sm tracking-wide"
                  style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
                  data-testid="continue-to-payment-button"
                >
                  CONTINUE TO PAYMENT
                </Button>
              </div>
            )}

            {/* Step 3: UPI Payment */}
            {step === 3 && (
              <div className="space-y-6 p-8 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
                <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="payment-title">UPI Payment</h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="upiId" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Enter UPI ID</Label>
                    <Input
                      id="upiId"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bankname"
                      className="mt-2"
                      disabled={paymentProcessing}
                      data-testid="upi-id-input"
                    />
                    <p className="text-xs mt-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Format: username@bankname</p>
                  </div>

                  <div className="text-center py-8" style={{ backgroundColor: '#F0EBE5' }}>
                    <p className="text-sm mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>Or scan QR code</p>
                    <div className="inline-block p-4 bg-white rounded-sm">
                      <QRCode value={`upi://pay?pa=merchant@upi&pn=Luminaire&am=${total}&cu=INR`} size={150} />
                    </div>
                    <p className="text-xs mt-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                      Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                      <button
                        key={app}
                        className="p-4 rounded-sm text-sm hover:opacity-70"
                        style={{ backgroundColor: '#F0EBE5', fontFamily: 'Manrope, sans-serif', color: '#2D241B', transition: 'opacity 0.3s' }}
                        data-testid={`upi-app-${app.toLowerCase().replace(' ', '-')}`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handlePaymentSubmit}
                    disabled={paymentProcessing || !upiId}
                    className="w-full py-6 text-sm tracking-wide"
                    style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
                    data-testid="simulate-payment-button"
                  >
                    {paymentProcessing ? 'PROCESSING PAYMENT...' : 'SIMULATE PAYMENT'}
                  </Button>

                  <p className="text-xs text-center" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                    This is a simulated payment. No actual transaction will occur.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-8 rounded-sm sticky top-24" style={{ backgroundColor: '#F0EBE5' }}>
              <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="order-summary-title">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>
                  <span>Subtotal</span>
                  <span data-testid="summary-subtotal">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>
                  <span>Shipping</span>
                  <span data-testid="summary-shipping">₹{shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4" style={{ borderColor: '#E5E0D8' }}>
                  <div className="flex justify-between text-xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
                    <span>Total</span>
                    <span data-testid="summary-total">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                <p>• Free shipping on orders over ₹1000</p>
                <p>• Estimated delivery: 5-7 business days</p>
                <p>• 30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
