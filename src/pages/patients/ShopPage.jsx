import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Button, Spin, message } from 'antd';
import { 
  Eye, 
  ChevronDown, 
  ShieldCheck, 
  UserCheck, 
  User, 
  Settings, 
  LogOut, 
  ShoppingCart as CartIcon 
} from 'lucide-react';
import { useAppContext } from '../../contexts/app/AppContext';
import { useCart } from '../../contexts/cart/CartContext';
import SmartProductRecommendation from '../../components/patient/shop/SmartProductRecommendation';
import ProductCard from '../../components/shop/ProductCard';
import CategoryCard from '../../components/shop/CategoryCard';
import ShoppingCart from '../../pages/shop/components/ShoppingCart';
import { useProducts, useProductCategories } from '../../apis/products/hooks';
import './shop/ShopPage.css';

/**
 * ShopPage component displays products for purchase
 */
const ShopPage = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useAppContext();
  const { getCartItemCount, addItem, cartItems } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch products and categories from API
  const { 
    data: products, 
    isLoading: isLoadingProducts, 
    error: productsError 
  } = useProducts();
  
  const { 
    data: categories, 
    isLoading: isLoadingCategories, 
    error: categoriesError 
  } = useProductCategories();

  // Update cart count from CartContext whenever it changes
  useEffect(() => {
    setCartCount(getCartItemCount());
  }, [getCartItemCount, cartItems]);

  // Handlers for cart and category navigation
  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    // In a real implementation, this would navigate to a category page
    // or filter the current page
    console.log('Category selected:', categoryId);
  };

  const handleViewBundle = () => {
    // In a real implementation, this would navigate to the bundle page
    // or open a modal with bundle details
    console.log('View bundle clicked');
  };

  const handleSkip = () => {
    console.log('Skip clicked');
  };

  const handleAddToCart = (product) => {
    // In a real implementation, this would add the product to the cart
    // For now, we'll just show a message
    if (product.requiresPrescription) {
      message.info(`${product.name} requires a prescription. Starting consultation flow.`);
      // In a real implementation, this would navigate to the consultation flow
    } else {
      // Add to cart with default dose for simplicity
      // In a real implementation, this would open a modal to select dose
      const defaultDose = { 
        id: 'default', 
        value: 'Standard',
        allowOneTimePurchase: true 
      };
      
      // Ensure the product has all required properties
      const enhancedProduct = {
        ...product,
        allowOneTimePurchase: true,
        price: parseFloat(product.price?.replace(/[^0-9.]/g, '')) || 25, // Extract numeric price or default to 25
        type: product.type || 'standard'
      };
      
      addItem(enhancedProduct, defaultDose);
      message.success(`${product.name} added to cart!`);
    }
  };

  // Navigate to admin dashboard when viewMode changes to 'admin'
  useEffect(() => {
    if (viewMode === 'admin') {
      console.log('Navigating to admin dashboard');
      navigate('/admin/dashboard');
    }
  }, [viewMode, navigate]);

  // Apply theme to product cards based on their program class
  useEffect(() => {
    document.querySelectorAll('.product-card').forEach(card => {
      if (card.classList.contains('program-weight')) {
        card.style.setProperty('--primary', '#0891b2');
        card.style.setProperty('--primary-light-bg', '#ecfeff');
      } else if (card.classList.contains('program-hair')) {
        card.style.setProperty('--primary', '#7c3aed');
        card.style.setProperty('--primary-light-bg', '#f3f4f6');
      } else if (card.classList.contains('program-aging')) {
        card.style.setProperty('--primary', '#ea580c');
        card.style.setProperty('--primary-light-bg', '#fef3c7');
      } else if (card.classList.contains('program-women')) {
        card.style.setProperty('--primary', '#ec4899');
        card.style.setProperty('--primary-light-bg', '#fdf2f8');
      } else if (card.classList.contains('program-mental')) {
        card.style.setProperty('--primary', '#059669');
        card.style.setProperty('--primary-light-bg', '#ecfdf5');
      }
    });

    // Add wheel event listeners for horizontal scrolling
    document.querySelectorAll('.category-scroll, .hero-cards').forEach(scroll => {
      const handleWheel = (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          scroll.scrollLeft += e.deltaY * 2;
        }
      };
      
      scroll.addEventListener('wheel', handleWheel);
      
      return () => {
        scroll.removeEventListener('wheel', handleWheel);
      };
    });
  }, [products, categories]);

  // SVG icons for product cards
  const icons = {
    glp1: (
      <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7-7m0 0l-7 7m7-7v18"></path>
      </svg>
    ),
    heart: (
      <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
    ),
    test: (
      <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    ),
    minoxidil: (
      <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m-4-4l4-4m6 1h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4a2 2 0 012-2z"></path>
      </svg>
    ),
    hairkit: (
      <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-7-7m14-8l-7 7-7-7"></path>
      </svg>
    ),
    sun: (
      <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
    ),
    question: (
      <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    check: (
      <svg className="product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
  };

  // Helper function to get icon based on product type
  const getIconForProduct = (product) => {
    const iconMap = {
      'weight-loss': icons.glp1,
      'sexual-health': icons.heart,
      'hair-care': icons.hairkit,
      'skin-care': icons.sun,
      'womens-health': icons.heart,
      'mental-health': icons.check,
    };
    
    return iconMap[product.category] || icons.question;
  };

  // Helper function to get program class based on product category
  const getProgramClass = (product) => {
    const classMap = {
      'weight-loss': 'program-weight',
      'sexual-health': 'program-weight',
      'hair-care': 'program-hair',
      'skin-care': 'program-aging',
      'womens-health': 'program-women',
      'mental-health': 'program-mental',
    };
    
    return classMap[product.category] || 'program-weight';
  };

  // Group products by category
  const productsByCategory = products ? 
    products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {}) : {};

  // Loading state
  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (productsError || categoriesError) {
    return (
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex justify-center items-center flex-col p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Products</h2>
        <p className="text-gray-700 mb-4">
          {productsError?.message || categoriesError?.message || 'An error occurred while loading products.'}
        </p>
        <Button type="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen">
      {/* Debug View Mode Display */}
      <div className="fixed top-6 left-6 z-50 bg-white/90 backdrop-blur-sm shadow-md rounded-lg p-2 text-xs">
        <span className="font-bold">Current View:</span> {viewMode}
      </div>
      
      {/* User Profile with View Mode Toggle */}
      <div className="fixed top-6 right-24 z-50 flex items-center gap-2">
        {/* Direct View Mode Toggle Buttons */}
        <div className="flex bg-white/90 backdrop-blur-sm shadow-md rounded-lg overflow-hidden">
          <button 
            className={`px-3 py-1.5 text-xs font-medium ${viewMode === 'admin' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setViewMode('admin')}
          >
            Admin
          </button>
          <button 
            className={`px-3 py-1.5 text-xs font-medium ${viewMode === 'patient' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setViewMode('patient')}
          >
            Patient
          </button>
        </div>
        
        {/* Profile Dropdown */}
        <Dropdown
          menu={{
            items: [
              {
                key: 'admin',
                icon: <ShieldCheck size={14} />,
                label: 'Admin View',
                disabled: viewMode === 'admin',
              },
              {
                key: 'patient',
                icon: <UserCheck size={14} />,
                label: 'Patient View',
                disabled: viewMode === 'patient',
              },
              {
                type: 'divider',
              },
              {
                key: 'profile',
                icon: <User size={14} />,
                label: 'Your Profile',
              },
              {
                key: 'settings',
                icon: <Settings size={14} />,
                label: 'Settings',
              },
              {
                key: 'logout',
                icon: <LogOut size={14} />,
                label: 'Sign out',
              },
            ],
            onClick: ({ key }) => {
              if (key === 'admin' || key === 'patient') {
                if (key !== viewMode) {
                  console.log(`Setting view mode to: ${key}`);
                  setViewMode(key);
                }
              } else if (key === 'profile') {
                // Navigate to profile
                console.log('Navigate to profile');
              } else if (key === 'settings') {
                // Navigate to settings
                console.log('Navigate to settings');
              } else if (key === 'logout') {
                // Logout
                console.log('Logout');
              }
            },
          }}
          trigger={['click']}
        >
          <div className="flex items-center bg-white/90 backdrop-blur-sm shadow-md rounded-full p-1 cursor-pointer">
            <img
              className="h-8 w-8 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="User avatar"
            />
          </div>
        </Dropdown>
      </div>
      
      {/* Cart */}
      <div className="cart" onClick={openCart}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8H15m-8-8h10"></path>
        </svg>
        <span className="cart-count">{cartCount}</span>
      </div>
      
      {/* Shopping Cart Modal */}
      {isCartOpen && <ShoppingCart isOpen={isCartOpen} onClose={closeCart} />}
      
      {/* Header */}
      <header className="header pt-12 pb-6 px-6">
        <h1 className="text-xl font-bold text-white">Shop</h1>
        <p className="text-white/80 text-sm mt-1">Personalized care delivered to you</p>
      </header>
      
      {/* Main Content */}
      <main className="pb-20">
        {/* Weight Loss Hero */}
        <div className="hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-badge">🔥 Most Popular</div>
            <h1>Weight Loss</h1>
            <p>Personalized treatment plans with GLP-1 medications that put you first</p>
          </div>
          
          {/* Medical cards */}
          <div className="hero-cards">
            <div className="hero-med-card">
              <span className="rx-badge-small">Rx</span>
              <h3>GLP-1</h3>
              <p>Starting at $299/mo</p>
            </div>
            <div className="hero-med-card">
              <span className="rx-badge-small">Rx</span>
              <h3>Tirzepatide</h3>
              <p>Starting at $399/mo</p>
            </div>
            <div className="hero-med-card">
              <h3>Nutrition Plan</h3>
              <p>Personalized coaching</p>
            </div>
          </div>
        </div>
        
        {/* --- Smart Product Recommendation (AI Engine) --- */}
        <SmartProductRecommendation 
          handleViewBundle={handleViewBundle} 
          handleSkip={handleSkip} 
        />
        
        {/* Sexual Health */}
        <div className="category">
          <h2 className="category-title">Sexual Health</h2>
          <div className="category-scroll">
            <CategoryCard
              image="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=230&h=345&fit=crop&q=80"
              title="Sexual Health"
              subtitle="26 products"
              onClick={() => openCategory('sexual-health')}
            />
            <ProductCard
              programClass="program-weight"
              requiresPrescription={true}
              icon={icons.glp1}
              name="Hard Mints"
              subtitle="Quick Dissolve"
              price="from $1.63/use"
              onClick={() => handleAddToCart({
                id: 'hard-mints',
                name: 'Hard Mints',
                requiresPrescription: true,
                category: 'sexual-health'
              })}
            />
            <ProductCard
              programClass="program-weight"
              requiresPrescription={true}
              icon={icons.heart}
              name="ED Treatment"
              subtitle="Fast Acting"
              price="$39/month"
              onClick={() => handleAddToCart({
                id: 'ed-treatment',
                name: 'ED Treatment',
                requiresPrescription: true,
                category: 'sexual-health'
              })}
            />
            <ProductCard
              programClass="program-weight"
              requiresPrescription={true}
              icon={icons.test}
              name="Testosterone"
              subtitle="Hormone Support"
              price="$89/month"
              onClick={() => handleAddToCart({
                id: 'testosterone',
                name: 'Testosterone',
                requiresPrescription: true,
                category: 'sexual-health'
              })}
            />
          </div>
        </div>
        
        {/* Hair Care */}
        <div className="category">
          <h2 className="category-title">Hair Care</h2>
          <div className="category-scroll">
            <CategoryCard
              image="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=230&h=345&fit=crop&q=80"
              title="Hair"
              subtitle="19 products"
              onClick={() => openCategory('hair-care')}
            />
            <ProductCard
              programClass="program-hair"
              requiresPrescription={true}
              icon={icons.minoxidil}
              name="Minoxidil + Supplements"
              subtitle="Hair Growth"
              price="$39/month"
              onClick={() => handleAddToCart({
                id: 'minoxidil-supplements',
                name: 'Minoxidil + Supplements',
                requiresPrescription: true,
                category: 'hair-care'
              })}
            />
            <ProductCard
              programClass="program-hair"
              requiresPrescription={true}
              icon={icons.hairkit}
              name="Hair Loss Kit"
              subtitle="Complete Treatment"
              price="$37/month"
              onClick={() => handleAddToCart({
                id: 'hair-loss-kit',
                name: 'Hair Loss Kit',
                requiresPrescription: true,
                category: 'hair-care'
              })}
            />
            <ProductCard
              programClass="program-hair"
              requiresPrescription={false}
              icon={icons.sun}
              name="Thickening Shampoo"
              subtitle="Volume Boost"
              price="$25/month"
              onClick={() => handleAddToCart({
                id: 'thickening-shampoo',
                name: 'Thickening Shampoo',
                requiresPrescription: false,
                category: 'hair-care'
              })}
            />
          </div>
        </div>
        
        {/* Skin Care */}
        <div className="category">
          <h2 className="category-title">Skin Care</h2>
          <div className="category-scroll">
            <CategoryCard
              image="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=230&h=345&fit=crop&q=80"
              title="Skin"
              subtitle="7 products"
              onClick={() => openCategory('skincare')}
            />
            <ProductCard
              programClass="program-aging"
              requiresPrescription={true}
              icon={icons.sun}
              name="Retinol Serum"
              subtitle="Anti-Aging Formula"
              price="$45/month"
              onClick={() => handleAddToCart({
                id: 'retinol-serum',
                name: 'Retinol Serum',
                requiresPrescription: true,
                category: 'skin-care'
              })}
            />
            <ProductCard
              programClass="program-aging"
              requiresPrescription={false}
              icon={icons.question}
              name="Daily Moisturizer"
              subtitle="Hydration"
              price="$25/month"
              onClick={() => handleAddToCart({
                id: 'daily-moisturizer',
                name: 'Daily Moisturizer',
                requiresPrescription: false,
                category: 'skin-care'
              })}
            />
            <ProductCard
              programClass="program-aging"
              requiresPrescription={false}
              icon={icons.sun}
              name="Vitamin C Serum"
              subtitle="Brightening"
              price="$30/month"
              onClick={() => handleAddToCart({
                id: 'vitamin-c-serum',
                name: 'Vitamin C Serum',
                requiresPrescription: false,
                category: 'skin-care'
              })}
            />
          </div>
        </div>
        
        {/* Women's Health */}
        <div className="category">
          <h2 className="category-title">Women's Health</h2>
          <div className="category-scroll">
            <CategoryCard
              image="https://images.unsplash.com/photo-1594824721513-52e16d8b2e65?w=230&h=345&fit=crop&q=80"
              title="Women's Health"
              subtitle="12 products"
              onClick={() => openCategory('womens-health')}
            />
            <ProductCard
              programClass="program-women"
              requiresPrescription={true}
              icon={icons.heart}
              name="Birth Control"
              subtitle="Monthly Supply"
              price="$30/month"
              onClick={() => handleAddToCart({
                id: 'birth-control',
                name: 'Birth Control',
                requiresPrescription: true,
                category: 'womens-health'
              })}
            />
            <ProductCard
              programClass="program-women"
              requiresPrescription={true}
              icon={icons.sun}
              name="Hormone Support"
              subtitle="Balance & Wellness"
              price="$69/month"
              onClick={() => handleAddToCart({
                id: 'hormone-support',
                name: 'Hormone Support',
                requiresPrescription: true,
                category: 'womens-health'
              })}
            />
            <ProductCard
              programClass="program-women"
              requiresPrescription={false}
              icon={icons.check}
              name="Fertility Support"
              subtitle="Conception Help"
              price="$49/month"
              onClick={() => handleAddToCart({
                id: 'fertility-support',
                name: 'Fertility Support',
                requiresPrescription: false,
                category: 'womens-health'
              })}
            />
          </div>
        </div>
        
        {/* Mental Health */}
        <div className="category">
          <h2 className="category-title">Mental Health</h2>
          <div className="category-scroll">
            <CategoryCard
              image="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=230&h=345&fit=crop&q=80"
              title="Mental Health"
              subtitle="8 products"
              onClick={() => openCategory('mental-health')}
            />
            <ProductCard
              programClass="program-mental"
              requiresPrescription={true}
              icon={icons.sun}
              name="Anxiety Treatment"
              subtitle="Effective Relief"
              price="$49/month"
              onClick={() => handleAddToCart({
                id: 'anxiety-treatment',
                name: 'Anxiety Treatment',
                requiresPrescription: true,
                category: 'mental-health'
              })}
            />
            <ProductCard
              programClass="program-mental"
              requiresPrescription={true}
              icon={icons.sun}
              name="Depression Support"
              subtitle="Mental Wellness"
              price="$59/month"
              onClick={() => handleAddToCart({
                id: 'depression-support',
                name: 'Depression Support',
                requiresPrescription: true,
                category: 'mental-health'
              })}
            />
            <ProductCard
              programClass="program-mental"
              requiresPrescription={false}
              icon={icons.check}
              name="Sleep Support"
              subtitle="Better Rest"
              price="$29/month"
              onClick={() => handleAddToCart({
                id: 'sleep-support',
                name: 'Sleep Support',
                requiresPrescription: false,
                category: 'mental-health'
              })}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopPage;
