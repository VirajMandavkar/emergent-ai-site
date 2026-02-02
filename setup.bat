@echo off
REM Luminaire - Premium Candle Shop Setup Script for Windows
echo 🕯️  Welcome to Luminaire - Premium Candle Shop Setup
echo ==================================================

REM Check prerequisites
echo 📋 Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 20+ LTS
    pause
    exit /b 1
)

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9+
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Backend Setup
echo.
echo 🔧 Setting up backend...
cd backend

REM Install Python dependencies
echo 📦 Installing Python dependencies...
python -m pip install -r requirements-simple.txt

REM Check if .env exists, if not create template
if not exist .env (
    echo 📝 Creating backend .env file...
    (
        echo MONGO_URL="mongodb://localhost:27017"
        echo DB_NAME="candle_shop"
        echo CORS_ORIGINS="*"
        echo JWT_SECRET="your-secret-key-change-in-production"
    ) > .env
    echo ⚠️  Please update backend\.env with your MongoDB credentials
)

REM Initialize database
echo 🗄️  Initializing database...
python init_db.py

echo ✅ Backend setup complete

REM Frontend Setup
echo.
echo 🎨 Setting up frontend...
cd ..\frontend

REM Install Node dependencies
echo 📦 Installing Node dependencies...
npm install

REM Check if .env exists, if not create template
if not exist .env (
    echo 📝 Creating frontend .env file...
    (
        echo VITE_BACKEND_URL=http://localhost:8000
        echo VITE_SOCKET_PORT=443
        echo VITE_ENABLE_HEALTH_CHECK=false
    ) > .env
)

echo ✅ Frontend setup complete

REM Instructions
echo.
echo 🚀 Setup Complete! To run the application:
echo.
echo 1. Start MongoDB ^(if running locally^)
echo 2. Start backend server:
echo    cd backend && python -c "import uvicorn; uvicorn.run('server:app', host='0.0.0.0', port=8000, reload=True)"
echo.
echo 3. Start frontend server ^(in new terminal^):
echo    cd frontend && npm run dev
echo.
echo 4. Open browser to: http://localhost:3000
echo.
echo 📚 Test Credentials:
echo    Admin: admin@candles.com / admin123
echo    User:  user@candles.com / user123
echo.
echo 📖 For detailed setup instructions, check README.md
echo.
echo 🎉 Happy Coding!
pause
