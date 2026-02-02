# Luminaire - Premium Candle Shop

A modern full-stack candle e-commerce application built with React 18, Vite 6, FastAPI, and MongoDB.

## 🛍️ Features

- **Product Catalog**: Browse scented, unscented, decorative, and eco-friendly candles
- **User Authentication**: Secure login/registration with JWT tokens
- **Shopping Cart**: Add/remove items with quantity management
- **Order Management**: Complete checkout process with order tracking
- **Admin Dashboard**: Manage products, orders, and users
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern Stack**: Vite 6 for fast development, FastAPI for backend

## 🚀 Tech Stack

### Frontend
- **React 18** with hooks
- **Vite 6** for build tooling
- **Tailwind CSS 3** for styling
- **React Router 6** for navigation
- **Axios** for API calls
- **React Hook Form + Zod** for forms
- **shadcn/ui** components
- **Recharts** for analytics

### Backend
- **FastAPI** for REST API
- **MongoDB** with Motor (async driver)
- **JWT** for authentication
- **bcrypt** for password hashing
- **Pydantic** for data validation

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js 20+** (LTS recommended)
- **Python 3.9+**
- **MongoDB** (running locally or MongoDB Atlas)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/VirajMandavkar/emergent-ai-site.git
cd emergent-ai-site
```

### 2. Backend Setup

#### 2.1 Install Python Dependencies

```bash
cd backend
python -m pip install -r requirements-simple.txt
```

#### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="candle_shop"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production"
```

**For MongoDB Atlas (recommended for production):**
```env
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/candle_shop?retryWrites=true&w=majority"
```

#### 2.3 Initialize Database

```bash
python init_db.py
```

This will:
- Create the database collections
- Add sample products (21 candles)
- Create admin and test user accounts

**Test Credentials:**
- Admin: `admin@candles.com` / `admin123`
- User: `user@candles.com` / `user123`

#### 2.4 Start Backend Server

```bash
# Option 1: Using uvicorn (recommended)
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using Python directly
python -c "import uvicorn; uvicorn.run('server:app', host='0.0.0.0', port=8000, reload=True)"
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

#### 3.1 Install Node Dependencies

```bash
cd frontend
npm install
```

#### 3.2 Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:8000
VITE_SOCKET_PORT=443
VITE_ENABLE_HEALTH_CHECK=false
```

#### 3.3 Start Frontend Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

## 🏃‍♂️ Running the Application

1. **Start MongoDB** (if running locally)
2. **Start Backend Server**: `cd backend && uvicorn server:app --reload --port 8000`
3. **Start Frontend Server**: `cd frontend && npm run dev`
4. **Open Browser**: Navigate to `http://localhost:3000`

## 📁 Project Structure

```
emergent-ai-site/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── init_db.py            # Database initialization script
│   ├── requirements-simple.txt # Python dependencies
│   └── .env                  # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   └── index.jsx         # App entry point
│   ├── public/               # Static assets
│   ├── vite.config.js        # Vite configuration
│   ├── package.json          # Node dependencies
│   └── .env                  # Frontend environment variables
└── README.md
```

## 🔧 Development Commands

### Backend
```bash
# Install dependencies
pip install -r requirements-simple.txt

# Start development server
uvicorn server:app --reload --port 8000

# Initialize database
python init_db.py
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get specific product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### Cart & Orders
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Update cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Manage users

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Set environment variables in hosting dashboard

### Backend (Heroku/Railway/Render)
1. Set environment variables in hosting platform
2. Deploy using the platform's GitHub integration
3. Ensure MongoDB is accessible (use MongoDB Atlas for production)

## 🔒 Environment Variables

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="candle_shop"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production"
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:8000
VITE_SOCKET_PORT=443
VITE_ENABLE_HEALTH_CHECK=false
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGO_URL in backend/.env
   - For MongoDB Atlas, whitelist your IP

2. **Frontend Can't Connect to Backend**
   - Verify backend is running on port 8000
   - Check VITE_BACKEND_URL in frontend/.env
   - Ensure no firewall blocking the connection

3. **Python Module Not Found**
   - Use `python -m pip install` instead of `pip`
   - Ensure you're using Python 3.9+

4. **Node Dependencies Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

5. **Build Failures**
   - Ensure all environment variables are set
   - Check for any syntax errors in recent changes

### Getting Help

1. Check the browser console for frontend errors
2. Check the terminal for backend errors
3. Verify all environment variables are correctly set
4. Ensure MongoDB is accessible

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy Coding! 🎉**
