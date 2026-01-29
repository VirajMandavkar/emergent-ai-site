import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from datetime import datetime, timezone
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_database():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Clear existing data
    await db.users.delete_many({})
    await db.products.delete_many({})
    await db.orders.delete_many({})
    await db.carts.delete_many({})
    
    # Create admin user
    admin_id = str(uuid.uuid4())
    admin_doc = {
        "id": admin_id,
        "name": "Admin User",
        "email": "admin@candles.com",
        "password": pwd_context.hash("admin123"),
        "role": "admin",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_doc)
    
    # Create demo user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": "Demo User",
        "email": "user@candles.com",
        "password": pwd_context.hash("user123"),
        "role": "user",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Sample products
    products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Lavender Dreams",
            "price": 599,
            "originalPrice": 799,
            "category": "Scented",
            "fragrance": "Lavender",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "40-45 hours",
            "stock": 25,
            "images": ["https://images.unsplash.com/photo-1627808587525-194446b07384?w=800", "https://images.unsplash.com/photo-1602874801006-223f8178e440?w=800"],
            "description": "Indulge in the calming essence of pure lavender. Hand-poured with natural soy wax, this candle creates a serene atmosphere perfect for relaxation and meditation.",
            "rating": 4.5,
            "reviews": 42,
            "sku": "SCE-LAV001",
            "featured": True,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Vanilla Bourbon",
            "price": 649,
            "originalPrice": 849,
            "category": "Scented",
            "fragrance": "Vanilla",
            "size": "10 oz",
            "weight": "283g",
            "burnTime": "50-55 hours",
            "stock": 30,
            "images": ["https://images.unsplash.com/photo-1604478498491-d63d698dfe0b?w=800", "https://images.unsplash.com/photo-1602874801138-3190c0c2e9cd?w=800"],
            "description": "Rich, warm vanilla infused with hints of bourbon. A luxurious scent that transforms any space into a cozy sanctuary.",
            "rating": 4.8,
            "reviews": 68,
            "sku": "SCE-VAN001",
            "featured": True,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sandalwood Serenity",
            "price": 699,
            "originalPrice": None,
            "category": "Scented",
            "fragrance": "Sandalwood",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "45-50 hours",
            "stock": 20,
            "images": ["https://images.unsplash.com/photo-1721274500738-f6e549c7d5fc?w=800", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"],
            "description": "Earthy and grounding sandalwood creates a meditative ambiance. Perfect for yoga, meditation, or unwinding after a long day.",
            "rating": 4.7,
            "reviews": 35,
            "sku": "SCE-SAN001",
            "featured": True,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ocean Breeze",
            "price": 549,
            "originalPrice": 699,
            "category": "Scented",
            "fragrance": "Citrus",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "40-45 hours",
            "stock": 35,
            "images": ["https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800", "https://images.unsplash.com/photo-1602874801006-223f8178e440?w=800"],
            "description": "Fresh and invigorating citrus blend reminiscent of ocean waves. Energizes your space with clean, crisp aromatics.",
            "rating": 4.3,
            "reviews": 28,
            "sku": "SCE-CIT001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Rose Garden",
            "price": 749,
            "originalPrice": None,
            "category": "Scented",
            "fragrance": "Rose",
            "size": "10 oz",
            "weight": "283g",
            "burnTime": "50-55 hours",
            "stock": 18,
            "images": ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800", "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800"],
            "description": "Delicate rose petals captured in wax. A romantic and elegant fragrance that elevates any setting.",
            "rating": 4.6,
            "reviews": 52,
            "sku": "SCE-ROS001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pure White Pillar",
            "price": 399,
            "originalPrice": None,
            "category": "Unscented",
            "fragrance": None,
            "size": "6 oz",
            "weight": "170g",
            "burnTime": "35-40 hours",
            "stock": 50,
            "images": ["https://images.unsplash.com/photo-1602874801138-3190c0c2e9cd?w=800", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"],
            "description": "Classic unscented pillar candle in pure white. Perfect for elegant dining and ambient lighting without fragrance.",
            "rating": 4.2,
            "reviews": 15,
            "sku": "UNS-PIL001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Ivory Taper Set",
            "price": 349,
            "originalPrice": None,
            "category": "Unscented",
            "fragrance": None,
            "size": "10 inch (set of 2)",
            "weight": "100g",
            "burnTime": "8-10 hours each",
            "stock": 60,
            "images": ["https://images.unsplash.com/photo-1602874801006-223f8178e440?w=800", "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800"],
            "description": "Elegant ivory taper candles perfect for formal dinners and special occasions. Dripless and long-lasting.",
            "rating": 4.4,
            "reviews": 22,
            "sku": "UNS-TAP001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Spiral Art Candle",
            "price": 899,
            "originalPrice": None,
            "category": "Decorative",
            "fragrance": None,
            "size": "8 inch",
            "weight": "300g",
            "burnTime": "Display piece",
            "stock": 12,
            "images": ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800", "https://images.unsplash.com/photo-1602874801138-3190c0c2e9cd?w=800"],
            "description": "Handcrafted spiral design candle that doubles as art. A stunning centerpiece that captures attention.",
            "rating": 4.9,
            "reviews": 18,
            "sku": "DEC-SPI001",
            "featured": True,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Geometric Cube",
            "price": 799,
            "originalPrice": None,
            "category": "Decorative",
            "fragrance": None,
            "size": "4x4 inch",
            "weight": "400g",
            "burnTime": "60+ hours",
            "stock": 15,
            "images": ["https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800", "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800"],
            "description": "Modern geometric cube candle in multi-toned layers. A contemporary statement piece for modern homes.",
            "rating": 4.7,
            "reviews": 31,
            "sku": "DEC-GEO001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Rainbow Wave",
            "price": 849,
            "originalPrice": None,
            "category": "Decorative",
            "fragrance": None,
            "size": "6 inch",
            "weight": "250g",
            "burnTime": "Display piece",
            "stock": 10,
            "images": ["https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800", "https://images.unsplash.com/photo-1602874801006-223f8178e440?w=800"],
            "description": "Vibrant rainbow-colored wave design. Brings playful energy and color to any space.",
            "rating": 4.5,
            "reviews": 25,
            "sku": "DEC-RAI001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Luxury Gift Set",
            "price": 1999,
            "originalPrice": 2499,
            "category": "Gift Sets",
            "fragrance": "Mixed",
            "size": "Set of 4 candles",
            "weight": "900g",
            "burnTime": "40-50 hours each",
            "stock": 20,
            "images": ["https://images.unsplash.com/photo-1627808587525-194446b07384?w=800", "https://images.unsplash.com/photo-1604478498491-d63d698dfe0b?w=800"],
            "description": "Premium gift set featuring our bestselling scents: Lavender, Vanilla, Sandalwood, and Rose. Beautifully packaged.",
            "rating": 4.9,
            "reviews": 78,
            "sku": "GIF-LUX001",
            "featured": True,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Seasonal Collection",
            "price": 1499,
            "originalPrice": None,
            "category": "Gift Sets",
            "fragrance": "Mixed",
            "size": "Set of 3 candles",
            "weight": "680g",
            "burnTime": "40-45 hours each",
            "stock": 25,
            "images": ["https://images.unsplash.com/photo-1721274500738-f6e549c7d5fc?w=800", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"],
            "description": "Curated seasonal scents that capture the essence of the current season. Perfect gift for any occasion.",
            "rating": 4.6,
            "reviews": 45,
            "sku": "GIF-SEA001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Soy Wax Natural",
            "price": 699,
            "originalPrice": None,
            "category": "Eco-Friendly",
            "fragrance": "Light Vanilla",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "45-50 hours",
            "stock": 40,
            "images": ["https://images.unsplash.com/photo-1602874801138-3190c0c2e9cd?w=800", "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800"],
            "description": "100% natural soy wax candle with organic cotton wick. Eco-friendly and sustainable, burns cleaner than paraffin.",
            "rating": 4.8,
            "reviews": 56,
            "sku": "ECO-SOY001",
            "featured": True,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Beeswax Pure",
            "price": 799,
            "originalPrice": None,
            "category": "Eco-Friendly",
            "fragrance": "Natural Honey",
            "size": "6 oz",
            "weight": "170g",
            "burnTime": "30-35 hours",
            "stock": 22,
            "images": ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800", "https://images.unsplash.com/photo-1602874801006-223f8178e440?w=800"],
            "description": "Pure beeswax candle with natural honey scent. Hypoallergenic and air-purifying properties.",
            "rating": 4.7,
            "reviews": 38,
            "sku": "ECO-BEE001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Bamboo Container Set",
            "price": 1299,
            "originalPrice": None,
            "category": "Eco-Friendly",
            "fragrance": "Green Tea",
            "size": "Set of 3",
            "weight": "600g",
            "burnTime": "35-40 hours each",
            "stock": 18,
            "images": ["https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800", "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800"],
            "description": "Sustainable bamboo containers with soy wax and green tea fragrance. Containers are reusable after burning.",
            "rating": 4.6,
            "reviews": 29,
            "sku": "ECO-BAM001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Cinnamon Spice",
            "price": 629,
            "originalPrice": None,
            "category": "Scented",
            "fragrance": "Cinnamon",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "40-45 hours",
            "stock": 28,
            "images": ["https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800", "https://images.unsplash.com/photo-1602874801138-3190c0c2e9cd?w=800"],
            "description": "Warm cinnamon spice with hints of clove. Creates a cozy, welcoming atmosphere perfect for fall and winter.",
            "rating": 4.4,
            "reviews": 41,
            "sku": "SCE-CIN001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Jasmine Night",
            "price": 679,
            "originalPrice": None,
            "category": "Scented",
            "fragrance": "Jasmine",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "40-45 hours",
            "stock": 32,
            "images": ["https://images.unsplash.com/photo-1602874801006-223f8178e440?w=800", "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800"],
            "description": "Exotic jasmine blooms captured in premium wax. A sophisticated floral scent for evening relaxation.",
            "rating": 4.5,
            "reviews": 33,
            "sku": "SCE-JAS001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pine Forest",
            "price": 649,
            "originalPrice": 799,
            "category": "Scented",
            "fragrance": "Pine",
            "size": "10 oz",
            "weight": "283g",
            "burnTime": "50-55 hours",
            "stock": 24,
            "images": ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800", "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"],
            "description": "Fresh pine forest scent brings the outdoors in. Perfect for creating a nature-inspired sanctuary.",
            "rating": 4.3,
            "reviews": 27,
            "sku": "SCE-PIN001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Coconut Paradise",
            "price": 599,
            "originalPrice": None,
            "category": "Scented",
            "fragrance": "Coconut",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "40-45 hours",
            "stock": 35,
            "images": ["https://images.unsplash.com/photo-1627808587525-194446b07384?w=800", "https://images.unsplash.com/photo-1604478498491-d63d698dfe0b?w=800"],
            "description": "Tropical coconut scent that transports you to a beach paradise. Sweet, creamy, and refreshing.",
            "rating": 4.6,
            "reviews": 48,
            "sku": "SCE-COC001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mint Eucalyptus",
            "price": 669,
            "originalPrice": None,
            "category": "Scented",
            "fragrance": "Mint",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "40-45 hours",
            "stock": 26,
            "images": ["https://images.unsplash.com/photo-1721274500738-f6e549c7d5fc?w=800", "https://images.unsplash.com/photo-1602874801138-3190c0c2e9cd?w=800"],
            "description": "Refreshing mint and eucalyptus blend. Clears the mind and energizes the space with crisp aromatics.",
            "rating": 4.7,
            "reviews": 36,
            "sku": "SCE-MIN001",
            "featured": False,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Amber Woods",
            "price": 749,
            "originalPrice": None,
            "category": "Scented",
            "fragrance": "Amber",
            "size": "10 oz",
            "weight": "283g",
            "burnTime": "50-55 hours",
            "stock": 19,
            "images": ["https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800", "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800"],
            "description": "Rich amber with woody undertones. A sophisticated masculine scent perfect for study or home office.",
            "rating": 4.8,
            "reviews": 44,
            "sku": "SCE-AMB001",
            "featured": True,
            "dateAdded": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    
    print(f"Database initialized successfully!")
    print(f"Created {len(products)} products")
    print(f"Admin credentials: admin@candles.com / admin123")
    print(f"User credentials: user@candles.com / user123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_database())
