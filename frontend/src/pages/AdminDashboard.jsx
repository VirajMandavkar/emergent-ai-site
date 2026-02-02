import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Package, ShoppingCart, Users, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Scented',
    fragrance: '',
    size: '',
    weight: '',
    burnTime: '',
    stock: '',
    images: '',
    description: '',
    featured: false
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, productsRes, ordersRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/products?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        stock: parseInt(productForm.stock),
        images: productForm.images.split(',').map(url => url.trim()),
        fragrance: productForm.fragrance || null
      };

      await axios.post(`${API}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Product added successfully');
      setIsAddModalOpen(false);
      setProductForm({
        name: '',
        price: '',
        originalPrice: '',
        category: 'Scented',
        fragrance: '',
        size: '',
        weight: '',
        burnTime: '',
        stock: '',
        images: '',
        description: '',
        featured: false
      });
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        stock: parseInt(productForm.stock),
        images: typeof productForm.images === 'string' 
          ? productForm.images.split(',').map(url => url.trim())
          : productForm.images,
        fragrance: productForm.fragrance || null
      };

      await axios.put(`${API}/products/${editingProduct}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Product updated successfully');
      setEditingProduct(null);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      category: product.category,
      fragrance: product.fragrance || '',
      size: product.size,
      weight: product.weight,
      burnTime: product.burnTime,
      stock: product.stock.toString(),
      images: Array.isArray(product.images) ? product.images.join(', ') : product.images,
      description: product.description,
      featured: product.featured
    });
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#A18267' }}></div>
          <p className="mt-4" style={{ color: '#2D241B', fontFamily: 'Manrope, sans-serif' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F9F8F6' }} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <h1 className="text-4xl md:text-5xl tracking-tight mb-12" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }} data-testid="admin-dashboard-title">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview" data-testid="overview-tab">Overview</TabsTrigger>
            <TabsTrigger value="products" data-testid="products-tab">Products</TabsTrigger>
            <TabsTrigger value="orders" data-testid="orders-tab">Orders</TabsTrigger>
            <TabsTrigger value="users" data-testid="users-tab">Users</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="stat-card-sales">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={24} style={{ color: '#A18267' }} />
                </div>
                <p className="text-2xl mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
                  ₹{stats?.totalSales?.toFixed(2) || 0}
                </p>
                <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Total Sales</p>
              </div>

              <div className="p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="stat-card-orders">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingCart size={24} style={{ color: '#A18267' }} />
                </div>
                <p className="text-2xl mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
                  {stats?.totalOrders || 0}
                </p>
                <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Total Orders</p>
              </div>

              <div className="p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="stat-card-products">
                <div className="flex items-center justify-between mb-2">
                  <Package size={24} style={{ color: '#A18267' }} />
                </div>
                <p className="text-2xl mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
                  {stats?.totalProducts || 0}
                </p>
                <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Total Products</p>
              </div>

              <div className="p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="stat-card-users">
                <div className="flex items-center justify-between mb-2">
                  <Users size={24} style={{ color: '#A18267' }} />
                </div>
                <p className="text-2xl mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>Total Users</p>
              </div>
            </div>

            <div className="p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
              <h3 className="text-xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }}>Recent Orders</h3>
              <div className="space-y-4">
                {stats?.recentOrders?.slice(0, 5).map(order => (
                  <div key={order.orderId} className="flex items-center justify-between pb-4 border-b" style={{ borderColor: '#E5E0D8' }}>
                    <div>
                      <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B' }}>{order.orderId}</p>
                      <p className="text-xs" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>₹{order.total.toFixed(2)}</p>
                      <span className="text-xs px-2 py-1 rounded-sm" style={{ backgroundColor: getStatusColor(order.status), color: '#FFFFFF' }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }}>Products</h2>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2" style={{ backgroundColor: '#A18267', color: '#FFFFFF' }} data-testid="add-product-button">
                    <Plus size={16} />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                        data-testid="product-name-input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                          data-testid="product-price-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Original Price (₹)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={productForm.originalPrice}
                          onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                          data-testid="product-original-price-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })}>
                          <SelectTrigger data-testid="product-category-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Scented">Scented</SelectItem>
                            <SelectItem value="Unscented">Unscented</SelectItem>
                            <SelectItem value="Decorative">Decorative</SelectItem>
                            <SelectItem value="Gift Sets">Gift Sets</SelectItem>
                            <SelectItem value="Eco-Friendly">Eco-Friendly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fragrance">Fragrance (optional)</Label>
                        <Input
                          id="fragrance"
                          value={productForm.fragrance}
                          onChange={(e) => setProductForm({ ...productForm, fragrance: e.target.value })}
                          data-testid="product-fragrance-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="size">Size</Label>
                        <Input
                          id="size"
                          value={productForm.size}
                          onChange={(e) => setProductForm({ ...productForm, size: e.target.value })}
                          required
                          placeholder="8 oz"
                          data-testid="product-size-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          value={productForm.weight}
                          onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                          required
                          placeholder="227g"
                          data-testid="product-weight-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                          required
                          data-testid="product-stock-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="burnTime">Burn Time</Label>
                      <Input
                        id="burnTime"
                        value={productForm.burnTime}
                        onChange={(e) => setProductForm({ ...productForm, burnTime: e.target.value })}
                        required
                        placeholder="40-45 hours"
                        data-testid="product-burn-time-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="images">Image URLs (comma separated)</Label>
                      <Textarea
                        id="images"
                        value={productForm.images}
                        onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                        required
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        data-testid="product-images-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        required
                        data-testid="product-description-input"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                        data-testid="product-featured-checkbox"
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>

                    <Button type="submit" className="w-full" style={{ backgroundColor: '#A18267', color: '#FFFFFF' }} data-testid="add-product-submit">
                      Add Product
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="product-row">
                  {editingProduct === product.id ? (
                    <form onSubmit={handleUpdateProduct} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                          placeholder="Product Name"
                          data-testid="edit-product-name"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                          placeholder="Price"
                          data-testid="edit-product-price"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" style={{ backgroundColor: '#A18267', color: '#FFFFFF' }} data-testid="save-product-button">Save</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} data-testid="cancel-edit-button">Cancel</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-sm" />
                        <div>
                          <p className="text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>{product.name}</p>
                          <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>{product.category} | Stock: {product.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>₹{product.price}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)} data-testid="edit-product-button">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)} style={{ color: '#EF4444' }} data-testid="delete-product-button">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }}>Orders</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.orderId} className="p-6 rounded-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="order-row">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <p className="text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>
                        Order: {order.orderId}
                      </p>
                      <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                        {new Date(order.orderDate).toLocaleDateString()} | ₹{order.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order.orderId, value)}>
                        <SelectTrigger className="w-40" data-testid="order-status-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>
                    {order.items.length} items | {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <h2 className="text-2xl mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B' }}>Users</h2>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="p-6 rounded-sm flex items-center justify-between" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }} data-testid="user-row">
                  <div>
                    <p className="text-base" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }}>{user.name}</p>
                    <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }}>{user.email}</p>
                  </div>
                  <div>
                    <span
                      className="px-3 py-1 text-xs rounded-sm"
                      style={{ backgroundColor: user.role === 'admin' ? '#A18267' : '#E5E0D8', color: user.role === 'admin' ? '#FFFFFF' : '#2D241B' }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
