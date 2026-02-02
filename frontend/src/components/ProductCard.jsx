import { Link } from 'react-router-dom';
import { Button } from './ui/button';

export const ProductCard = ({ product, onAddToCart }) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="group" data-testid="product-card">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-sm mb-4" style={{ paddingBottom: '125%', backgroundColor: '#F0EBE5' }}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105"
            style={{ transition: 'transform 0.5s ease-out' }}
            data-testid="product-image"
          />
          {hasDiscount && (
            <div
              className="absolute top-4 right-4 px-3 py-1 text-xs tracking-wide"
              style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
              data-testid="discount-badge"
            >
              SALE
            </div>
          )}
          {product.featured && (
            <div
              className="absolute top-4 left-4 px-3 py-1 text-xs tracking-wide"
              style={{ backgroundColor: '#2D241B', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif' }}
              data-testid="featured-badge"
            >
              FEATURED
            </div>
          )}
        </div>
      </Link>

      <div className="text-center space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg tracking-normal hover:opacity-70" style={{ fontFamily: 'Playfair Display, serif', color: '#2D241B', transition: 'opacity 0.3s' }} data-testid="product-name">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="product-category">
          {product.category}
        </p>
        <div className="flex items-center justify-center gap-2">
          {hasDiscount && (
            <span className="text-sm line-through" style={{ fontFamily: 'Manrope, sans-serif', color: '#8C847C' }} data-testid="original-price">
              ₹{product.originalPrice}
            </span>
          )}
          <span className="text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: '#2D241B', fontWeight: 500 }} data-testid="product-price">
            ₹{product.price}
          </span>
        </div>
        <Button
          onClick={() => onAddToCart(product.id)}
          className="w-full mt-3 text-sm tracking-wide hover:opacity-90"
          style={{ backgroundColor: '#A18267', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', transition: 'opacity 0.3s' }}
          data-testid="add-to-cart-button"
        >
          ADD TO CART
        </Button>
      </div>
    </div>
  );
};