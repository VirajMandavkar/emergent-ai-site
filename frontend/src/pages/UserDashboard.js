import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Package, User as UserIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDashboard = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      processing: '#3B82F6',
      shipped: '#A18267',
      delivered: '#10B981',
      cancelled: '#EF4444'
    };
    return colors[status] || '#8C847C';
  };

  return (
    <div style={{ backgroundColor: '#F9F8F6' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <h1 className="text-4xl md:text-5xl tracking-tight mb-12" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="dashboard-title">
          My Account
        </h1>

        <Tabs defaultValue="orders" className="space-y-8">
          <TabsList>
            <TabsTrigger value="orders" data-testid="orders-tab">
              <Package size={16} className="mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="profile-tab">
              <UserIcon size={16} className="mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-6">
              <h2 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="order-history-title">Order History</h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#A18267' }}></div>
                  <p className="mt-4" style={{ color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg mb-4" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="no-orders-message">No orders yet</p>
                  <Link to="/shop" className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#A18267', transition: 'opacity 0.3s' }}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.orderId} className="p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="order-card">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <p className="text-sm mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                            Order ID: <span style={{ color: '#2D241B' }} data-testid="order-id">{order.orderId}</span>
                          </p>
                          <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                            {new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <span
                            className="px-3 py-1 text-xs tracking-wide rounded-sm"
                            style={{ backgroundColor: getStatusColor(order.status), color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
                            data-testid="order-status"
                          >
                            {order.status.toUpperCase()}
                          </span>
                          <span className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }} data-testid="order-amount">
                            ₹{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex gap-3 text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-sm" />
                            <div>
                              <p>{item.name}</p>
                              <p style={{ color: '#8C847C' }}>Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>

                      <Link to={`/order-confirmation/${order.orderId}`}>
                        <button className="text-sm hover:opacity-70" style={{ fontFamily: 'Manrope, sans-serif', color: '#A18267', transition: 'opacity 0.3s' }} data-testid="view-order-button">
                          View Details →
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="p-8 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
              <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="profile-title">Profile Information</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Name</p>
                  <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} data-testid="profile-name">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Email</p>
                  <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} data-testid="profile-email">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Member Since</p>
                  <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }} data-testid="profile-created">
                    {new Date(user?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
