/**
 * Grocery Store Decoy Front-End
 * Shown to all unauthorized devices to mislead potential threats
 * Author: Jonathan Sherman - Monaco Edition
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search, MapPin, Phone, Mail, Clock, Star } from "lucide-react";
import { useState } from "react";

export default function GroceryStoreDecoy() {
  const [cart, setCart] = useState(0);

  const products = [
    { id: 1, name: "Fresh Organic Apples", price: 3.99, category: "Fruits", rating: 4.5, image: "🍎" },
    { id: 2, name: "Whole Wheat Bread", price: 2.49, category: "Bakery", rating: 4.7, image: "🍞" },
    { id: 3, name: "Farm Fresh Eggs", price: 4.29, category: "Dairy", rating: 4.8, image: "🥚" },
    { id: 4, name: "Organic Milk", price: 5.99, category: "Dairy", rating: 4.6, image: "🥛" },
    { id: 5, name: "Fresh Tomatoes", price: 2.99, category: "Vegetables", rating: 4.4, image: "🍅" },
    { id: 6, name: "Chicken Breast", price: 8.99, category: "Meat", rating: 4.9, image: "🍗" },
    { id: 7, name: "Wild Salmon", price: 12.99, category: "Seafood", rating: 4.8, image: "🐟" },
    { id: 8, name: "Orange Juice", price: 4.49, category: "Beverages", rating: 4.5, image: "🍊" },
  ];

  const addToCart = () => {
    setCart(cart + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🛒</div>
              <div>
                <h1 className="text-2xl font-bold">FreshMart Grocery</h1>
                <p className="text-green-100 text-sm">Your neighborhood grocery store</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:bg-green-700">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-green-700 relative">
                <ShoppingCart className="w-5 h-5" />
                {cart > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {cart}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Fresh Deals This Week!</h2>
          <p className="text-xl mb-6">Save up to 30% on organic produce</p>
          <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
            Shop Now
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Store Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle className="text-lg">Visit Us</CardTitle>
                  <CardDescription>123 Main Street, Seattle, WA 98101</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle className="text-lg">Store Hours</CardTitle>
                  <CardDescription>Mon-Sun: 7:00 AM - 10:00 PM</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle className="text-lg">Contact</CardTitle>
                  <CardDescription>(555) 123-4567</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Featured Products */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="text-center">
                    <div className="text-6xl mb-3">{product.image}</div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        ${product.price}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={addToCart}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Fruits", "Vegetables", "Dairy", "Meat", "Bakery", "Beverages", "Snacks", "Frozen"].map((category) => (
              <Card key={category} className="hover:bg-green-50 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <p className="font-semibold text-gray-700">{category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <Card className="bg-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Join Our Newsletter</CardTitle>
            <CardDescription className="text-green-100 text-center">
              Get weekly deals and exclusive offers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-800"
              />
              <Button className="bg-white text-green-600 hover:bg-green-50">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FreshMart Grocery</h3>
              <p className="text-gray-400">Your trusted source for fresh, quality groceries since 2010.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@freshmart.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FreshMart Grocery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
