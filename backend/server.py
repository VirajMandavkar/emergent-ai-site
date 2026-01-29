from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: EmailStr
    role: str = "user"
    createdAt: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    price: float
    originalPrice: Optional[float] = None
    category: str
    fragrance: Optional[str] = None
    size: str
    weight: str
    burnTime: str
    stock: int
    images: List[str]
    description: str
    rating: float = 0.0
    reviews: int = 0
    sku: str
    featured: bool = False
    dateAdded: str

class ProductCreate(BaseModel):
    name: str
    price: float
    originalPrice: Optional[float] = None
    category: str
    fragrance: Optional[str] = None
    size: str
    weight: str
    burnTime: str
    stock: int
    images: List[str]
    description: str
    featured: bool = False

class CartItem(BaseModel):
    productId: str
    quantity: int

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    userId: str
    items: List[CartItem]
    updatedAt: str

class ShippingAddress(BaseModel):
    fullName: str
    email: EmailStr
    phone: str
    addressLine1: str
    addressLine2: Optional[str] = None
    city: str
    state: str
    pinCode: str

class OrderCreate(BaseModel):
    items: List[CartItem]
    shippingAddress: ShippingAddress
    subtotal: float
    shipping: float
    total: float
    paymentMethod: str
    upiId: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    orderId: str
    userId: str
    items: List[dict]
    subtotal: float
    shipping: float
    total: float
    status: str
    shippingAddress: dict
    paymentMethod: str
    upiTransactionId: Optional[str] = None
    orderDate: str
    expectedDelivery: str

class OrderStatusUpdate(BaseModel):
    status: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# Auth endpoints
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hashed_password,
        "role": "user",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_id})
    user = User(**{k: v for k, v in user_doc.items() if k != "password"})
    
    return TokenResponse(access_token=access_token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": user["id"]})
    user_data = User(**{k: v for k, v in user.items() if k != "password" and k != "_id"})
    
    return TokenResponse(access_token=access_token, user=user_data)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Product endpoints
@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    fragrance: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 50
):
    query = {}
    if category:
        query["category"] = category
    if fragrance:
        query["fragrance"] = fragrance
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}}
        ]
    if minPrice is not None or maxPrice is not None:
        query["price"] = {}
        if minPrice is not None:
            query["price"]["$gte"] = minPrice
        if maxPrice is not None:
            query["price"]["$lte"] = maxPrice
    
    products = await db.products.find(query, {"_id": 0}).limit(limit).to_list(limit)
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_admin)):
    product_id = str(uuid.uuid4())
    sku = f"{product_data.category[:3].upper()}-{product_id[:8].upper()}"
    
    product_doc = {
        "id": product_id,
        "sku": sku,
        "rating": 0.0,
        "reviews": 0,
        "dateAdded": datetime.now(timezone.utc).isoformat(),
        **product_data.model_dump()
    }
    
    await db.products.insert_one(product_doc)
    return Product(**{k: v for k, v in product_doc.items() if k != "_id"})

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductCreate, current_user: User = Depends(get_current_admin)):
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_doc = product_data.model_dump()
    await db.products.update_one({"id": product_id}, {"$set": update_doc})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return Product(**updated)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: User = Depends(get_current_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Cart endpoints
@api_router.get("/cart", response_model=Cart)
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"userId": current_user.id}, {"_id": 0})
    if not cart:
        cart = {
            "userId": current_user.id,
            "items": [],
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
    return Cart(**cart)

@api_router.post("/cart")
async def update_cart(cart_items: List[CartItem], current_user: User = Depends(get_current_user)):
    cart_doc = {
        "userId": current_user.id,
        "items": [item.model_dump() for item in cart_items],
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.carts.update_one(
        {"userId": current_user.id},
        {"$set": cart_doc},
        upsert=True
    )
    
    return {"message": "Cart updated successfully"}

# Order endpoints
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    order_id = f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Get product details for items
    items_with_details = []
    for item in order_data.items:
        product = await db.products.find_one({"id": item.productId}, {"_id": 0})
        if product:
            items_with_details.append({
                "productId": item.productId,
                "name": product["name"],
                "price": product["price"],
                "quantity": item.quantity,
                "image": product["images"][0] if product["images"] else ""
            })
    
    order_doc = {
        "orderId": order_id,
        "userId": current_user.id,
        "items": items_with_details,
        "subtotal": order_data.subtotal,
        "shipping": order_data.shipping,
        "total": order_data.total,
        "status": "pending",
        "shippingAddress": order_data.shippingAddress.model_dump(),
        "paymentMethod": order_data.paymentMethod,
        "upiTransactionId": f"UPI-{str(uuid.uuid4())[:12].upper()}" if order_data.upiId else None,
        "orderDate": datetime.now(timezone.utc).isoformat(),
        "expectedDelivery": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.carts.delete_one({"userId": current_user.id})
    
    return Order(**{k: v for k, v in order_doc.items() if k != "_id"})

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    query = {"userId": current_user.id} if current_user.role != "admin" else {}
    orders = await db.orders.find(query, {"_id": 0}).sort("orderDate", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    query = {"orderId": order_id}
    if current_user.role != "admin":
        query["userId"] = current_user.id
    
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, current_user: User = Depends(get_current_admin)):
    result = await db.orders.update_one(
        {"orderId": order_id},
        {"$set": {"status": status_update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated successfully"}

# Admin endpoints
@api_router.get("/admin/dashboard")
async def get_dashboard_stats(current_user: User = Depends(get_current_admin)):
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({"role": "user"})
    
    # Calculate total sales
    orders = await db.orders.find({"status": {"$ne": "cancelled"}}, {"total": 1, "_id": 0}).to_list(1000)
    total_sales = sum(order.get("total", 0) for order in orders)
    
    # Recent orders
    recent_orders = await db.orders.find({}, {"_id": 0}).sort("orderDate", -1).limit(10).to_list(10)
    
    return {
        "totalSales": total_sales,
        "totalOrders": total_orders,
        "totalProducts": total_products,
        "totalUsers": total_users,
        "recentOrders": recent_orders
    }

@api_router.get("/admin/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(100)
    return users

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()