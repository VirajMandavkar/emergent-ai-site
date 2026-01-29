import requests
import sys
import json
from datetime import datetime

class CandleEcommerceAPITester:
    def __init__(self, base_url="https://candle-commerce.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            if not success:
                details += f", Expected: {expected_status}"
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication...")
        
        # Test user login
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": "user@candles.com", "password": "user123"}
        )
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            print(f"   User token obtained: {self.user_token[:20]}...")
        
        # Test admin login
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@candles.com", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")

        # Test invalid login
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrong"}
        )

        # Test user profile access
        if self.user_token:
            self.run_test(
                "Get User Profile",
                "GET",
                "auth/me",
                200,
                headers={"Authorization": f"Bearer {self.user_token}"}
            )

    def test_products(self):
        """Test product endpoints"""
        print("\n📦 Testing Products...")
        
        # Get all products
        success, products = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        
        if success and products:
            print(f"   Found {len(products)} products")
            
            # Test get single product
            product_id = products[0]['id']
            self.run_test(
                "Get Single Product",
                "GET",
                f"products/{product_id}",
                200
            )
            
            # Test product not found
            self.run_test(
                "Product Not Found",
                "GET",
                "products/nonexistent-id",
                404
            )

        # Test product filtering
        self.run_test(
            "Filter Products by Category",
            "GET",
            "products?category=Scented",
            200
        )

        self.run_test(
            "Filter Products by Price",
            "GET",
            "products?minPrice=100&maxPrice=1000",
            200
        )

        self.run_test(
            "Search Products",
            "GET",
            "products?search=candle",
            200
        )

        self.run_test(
            "Get Featured Products",
            "GET",
            "products?featured=true",
            200
        )

    def test_cart_operations(self):
        """Test cart operations"""
        print("\n🛒 Testing Cart Operations...")
        
        if not self.user_token:
            print("   Skipping cart tests - no user token")
            return

        # Get empty cart
        self.run_test(
            "Get Empty Cart",
            "GET",
            "cart",
            200,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )

        # Add items to cart
        cart_items = [
            {"productId": "test-product-1", "quantity": 2},
            {"productId": "test-product-2", "quantity": 1}
        ]
        
        self.run_test(
            "Update Cart",
            "POST",
            "cart",
            200,
            data=cart_items,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )

        # Get cart with items
        self.run_test(
            "Get Cart with Items",
            "GET",
            "cart",
            200,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )

    def test_orders(self):
        """Test order operations"""
        print("\n📋 Testing Orders...")
        
        if not self.user_token:
            print("   Skipping order tests - no user token")
            return

        # Get user orders
        self.run_test(
            "Get User Orders",
            "GET",
            "orders",
            200,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )

        # Test order creation
        order_data = {
            "items": [{"productId": "test-product-1", "quantity": 1}],
            "shippingAddress": {
                "fullName": "Test User",
                "email": "user@candles.com",
                "phone": "+91-9876543210",
                "addressLine1": "123 Test Street",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pinCode": "400001"
            },
            "subtotal": 500.0,
            "shipping": 50.0,
            "total": 550.0,
            "paymentMethod": "UPI",
            "upiId": "test@upi"
        }

        success, order_response = self.run_test(
            "Create Order",
            "POST",
            "orders",
            200,
            data=order_data,
            headers={"Authorization": f"Bearer {self.user_token}"}
        )

        if success and 'orderId' in order_response:
            order_id = order_response['orderId']
            
            # Get specific order
            self.run_test(
                "Get Specific Order",
                "GET",
                f"orders/{order_id}",
                200,
                headers={"Authorization": f"Bearer {self.user_token}"}
            )

    def test_admin_operations(self):
        """Test admin operations"""
        print("\n👑 Testing Admin Operations...")
        
        if not self.admin_token:
            print("   Skipping admin tests - no admin token")
            return

        # Get dashboard stats
        self.run_test(
            "Get Dashboard Stats",
            "GET",
            "admin/dashboard",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )

        # Get all users
        self.run_test(
            "Get All Users",
            "GET",
            "admin/users",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )

        # Get all orders (admin view)
        self.run_test(
            "Get All Orders (Admin)",
            "GET",
            "orders",
            200,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )

        # Test product creation
        new_product = {
            "name": "Test Candle",
            "price": 299.99,
            "category": "Scented",
            "fragrance": "Vanilla",
            "size": "8 oz",
            "weight": "227g",
            "burnTime": "40-45 hours",
            "stock": 10,
            "images": ["https://example.com/test-candle.jpg"],
            "description": "A test candle for API testing",
            "featured": False
        }

        success, product_response = self.run_test(
            "Create Product (Admin)",
            "POST",
            "products",
            200,
            data=new_product,
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )

        if success and 'id' in product_response:
            product_id = product_response['id']
            
            # Update product
            updated_product = {**new_product, "price": 349.99, "stock": 15}
            self.run_test(
                "Update Product (Admin)",
                "PUT",
                f"products/{product_id}",
                200,
                data=updated_product,
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )

            # Delete product
            self.run_test(
                "Delete Product (Admin)",
                "DELETE",
                f"products/{product_id}",
                200,
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )

    def test_unauthorized_access(self):
        """Test unauthorized access scenarios"""
        print("\n🚫 Testing Unauthorized Access...")
        
        # Test admin endpoints without token
        self.run_test(
            "Admin Dashboard (No Token)",
            "GET",
            "admin/dashboard",
            401
        )

        # Test admin endpoints with user token
        if self.user_token:
            self.run_test(
                "Admin Dashboard (User Token)",
                "GET",
                "admin/dashboard",
                403,
                headers={"Authorization": f"Bearer {self.user_token}"}
            )

        # Test cart access without token
        self.run_test(
            "Get Cart (No Token)",
            "GET",
            "cart",
            401
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting Candle E-commerce API Tests...")
        print(f"Testing against: {self.base_url}")
        
        self.test_authentication()
        self.test_products()
        self.test_cart_operations()
        self.test_orders()
        self.test_admin_operations()
        self.test_unauthorized_access()
        
        print(f"\n📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        # Print failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CandleEcommerceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())