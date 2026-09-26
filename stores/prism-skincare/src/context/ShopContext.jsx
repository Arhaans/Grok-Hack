import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '../data/products';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState('barrier-repair-serum');
  const [themeMode, setThemeMode] = useState('am'); // 'am' or 'pm'
  const [isMeditationOpen, setIsMeditationOpen] = useState(false);
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  const [cart, setCart] = useState([
    {
      product: PRODUCTS[0],
      size: "50ml / 1.7 fl oz",
      price: PRODUCTS[0].price,
      quantity: 1
    }
  ]);

  const [wishlist, setWishlist] = useState(['barrier-repair-serum', 'bio-retinol-night-oil']);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const openQuickView = (product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  // Toggle Theme Mode Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const toggleThemeMode = () => {
    const nextTheme = themeMode === 'am' ? 'pm' : 'am';
    setThemeMode(nextTheme);
    addToast(
      nextTheme === 'pm'
        ? 'Switched to PM Nocturnal Repair Mode (Candlelight Amber & Deep Sage)'
        : 'Switched to AM Dew Ritual Mode (Warm Ivory Sunlight)',
      'Ritual Theme Changed'
    );
  };

  // Scroll to top on view change
  const navigateToView = (viewName, productId = null) => {
    if (productId) {
      setSelectedProductId(productId);
    }
    setCurrentView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toast Helper
  const addToast = (message, title = 'Notification') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Functions
  const addToCart = (product, selectedSize = null, quantity = 1) => {
    const targetSize = selectedSize || (product.sizes ? product.sizes[0].size : 'Standard');
    const price = product.sizes ? (product.sizes.find(s => s.size === targetSize)?.price || product.price) : product.price;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === targetSize
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, size: targetSize, price, quantity }];
      }
    });

    addToast(`Added ${quantity}x ${product.name} (${targetSize}) to your bag.`, 'Added to Bag');
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    const removedItem = cart[index];
    setCart((prev) => prev.filter((_, i) => i !== index));
    if (removedItem) {
      addToast(`Removed ${removedItem.product.name} from bag.`, 'Bag Updated');
    }
  };

  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'PRISM15') {
      setDiscountRate(0.15);
      setPromoCode('PRISM15');
      setPromoError('');
      addToast('Promo code PRISM15 applied! 15% discount granted.', 'Discount Applied');
      return true;
    } else if (cleanCode === 'WELCOME10') {
      setDiscountRate(0.10);
      setPromoCode('WELCOME10');
      setPromoError('');
      addToast('Promo code WELCOME10 applied! 10% discount granted.', 'Discount Applied');
      return true;
    } else {
      setPromoError('Invalid promo code. Try "PRISM15"');
      return false;
    }
  };

  // Wishlist Functions
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const targetProduct = PRODUCTS.find(p => p.id === productId);
      if (exists) {
        addToast(`Removed ${targetProduct?.name || 'item'} from your wishlist.`, 'Wishlist');
        return prev.filter(id => id !== productId);
      } else {
        addToast(`Saved ${targetProduct?.name || 'item'} to your wishlist.`, 'Wishlist');
        return [...prev, productId];
      }
    });
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const giftPackagingCost = giftPackaging ? 12 : 0;
  const discountAmount = subtotal * discountRate;
  const freeShippingThreshold = 75;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingCost = isFreeShipping || cart.length === 0 ? 0 : 8;
  const total = subtotal - discountAmount + shippingCost + giftPackagingCost;
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const selectedProduct = PRODUCTS.find(p => p.id === selectedProductId) || PRODUCTS[0];

  return (
    <ShopContext.Provider
      value={{
        PRODUCTS,
        currentView,
        navigateToView,
        selectedProduct,
        setSelectedProductId,
        themeMode,
        toggleThemeMode,
        isMeditationOpen,
        setIsMeditationOpen,
        giftPackaging,
        setGiftPackaging,
        giftNote,
        setGiftNote,
        giftPackagingCost,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        subtotal,
        discountRate,
        discountAmount,
        promoCode,
        promoError,
        applyPromoCode,
        isFreeShipping,
        amountForFreeShipping,
        freeShippingThreshold,
        shippingCost,
        total,
        cartItemCount,
        wishlist,
        toggleWishlist,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isQuizOpen,
        setIsQuizOpen,
        searchQuery,
        setSearchQuery,
        quickViewProduct,
        openQuickView,
        closeQuickView,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
