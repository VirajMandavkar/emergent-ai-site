#!/bin/bash

# Luminaire - Premium Candle Shop Setup Script
echo "🕯️  Welcome to Luminaire - Premium Candle Shop Setup"
echo "=================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ LTS"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.9+"
    exit 1
fi

# Determine Python command
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "✅ Prerequisites check passed"

# Backend Setup
echo ""
echo "🔧 Setting up backend..."
cd backend

# Install Python dependencies
echo "📦 Installing Python dependencies..."
$PYTHON_CMD -m pip install -r requirements-simple.txt

# Check if .env exists, if not create template
if [ ! -f .env ]; then
    echo "📝 Creating backend .env file..."
    cat > .env << EOL
MONGO_URL="mongodb://localhost:27017"
DB_NAME="candle_shop"
CORS_ORIGINS="*"
JWT_SECRET="your-secret-key-change-in-production"
EOL
    echo "⚠️  Please update backend/.env with your MongoDB credentials"
fi

# Initialize database
echo "🗄️  Initializing database..."
$PYTHON_CMD init_db.py

echo "✅ Backend setup complete"

# Frontend Setup
echo ""
echo "🎨 Setting up frontend..."
cd ../frontend

# Install Node dependencies
echo "📦 Installing Node dependencies..."
npm install

# Check if .env exists, if not create template
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << EOL
VITE_BACKEND_URL=http://localhost:8000
VITE_SOCKET_PORT=443
VITE_ENABLE_HEALTH_CHECK=false
EOL
fi

echo "✅ Frontend setup complete"

# Instructions
echo ""
echo "🚀 Setup Complete! To run the application:"
echo ""
echo "1. Start MongoDB (if running locally)"
echo "2. Start backend server:"
echo "   cd backend && $PYTHON_CMD -c \"import uvicorn; uvicorn.run('server:app', host='0.0.0.0', port=8000, reload=True)\""
echo ""
echo "3. Start frontend server (in new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open browser to: http://localhost:3000"
echo ""
echo "📚 Test Credentials:"
echo "   Admin: admin@candles.com / admin123"
echo "   User:  user@candles.com / user123"
echo ""
echo "📖 For detailed setup instructions, check README.md"
echo ""
echo "🎉 Happy Coding!"
