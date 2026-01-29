import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { CheckCircle2, Package } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#A18267' }}></div>
          <p className="mt-4" style={{ color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}>Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
        <div className="text-center space-y-4">
          <h2 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }}>Order not found</h2>
          <Link to="/dashboard">
            <Button style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}>View Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F9F8F6' }} className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <CheckCircle2 size={64} style={{ color: '#A18267' }} />
          </div>
          <h1 className="text-4xl md:text-5xl tracking-tight mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', fontWeight: 600 }} data-testid="confirmation-title">
            Order Confirmed!
          </h1>
          <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="confirmation-message">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <div className="p-8 rounded-sm mb-8" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm tracking-wide mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Order ID</h3>
              <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }} data-testid="order-id">{order.orderId}</p>
            </div>
            <div>
              <h3 className="text-sm tracking-wide mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Order Date</h3>
              <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }} data-testid="order-date">
                {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <h3 className="text-sm tracking-wide mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Payment Status</h3>
              <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#A18267', fontWeight: 500 }} data-testid="payment-status">Paid</p>
            </div>
            <div>
              <h3 className="text-sm tracking-wide mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Expected Delivery</h3>
              <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }} data-testid="expected-delivery">
                {new Date(order.expectedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="border-t pt-8" style={{ borderColor: '#E5E0D8' }}>
            <h3 className="text-lg mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4" data-testid="order-item">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-sm" />
                  <div className="flex-grow">
                    <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>{item.name}</p>
                    <p className="text-xs" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t mt-8 pt-8" style={{ borderColor: '#E5E0D8' }}>
            <div className="space-y-2 text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>
              <div className="flex justify-between" style={{ color: '#2D241B' }}>
                <span>Subtotal</span>
                <span data-testid="order-subtotal">₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#2D241B' }}>
                <span>Shipping</span>
                <span data-testid="order-shipping">₹{order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-medium pt-2 border-t" style={{ color: '#2D241B', borderColor: '#E5E0D8' }}>
                <span>Total</span>
                <span data-testid="order-total">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="flex-1 sm:flex-none">
            <Button className="w-full py-6 text-sm tracking-wide flex items-center justify-center gap-2" style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }} data-testid="view-orders-button">
              <Package size={20} />
              VIEW MY ORDERS
            </Button>
          </Link>
          <Link to="/shop" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full py-6 text-sm tracking-wide" style={{ borderColor: '#E5E0D8', color: '#2D241B', fontFamily: 'Manrope, sans-serif' }} data-testid="continue-shopping-button">
              CONTINUE SHOPPING
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;