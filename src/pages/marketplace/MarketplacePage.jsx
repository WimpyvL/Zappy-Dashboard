import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import {
  Package,
  Search,
  Filter,
  PlusCircle,
  CheckCircle,
  FileText,
  BookOpen,
  Calendar,
  Tag,
} from 'lucide-react';
import { message, Tabs } from 'antd';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Semaglutide',
    type: 'medication',
    contentType: 'product',
    description: 'GLP-1 agonist for weight management',
    category: 'weight-management',
    requiresPrescription: true,
    oneTimePurchasePrice: 219.99,
    doses: [
      {
        id: 101,
        value: '0.25mg',
        description: 'Starting dose',
        allowOneTimePurchase: true,
      },
      {
        id: 102,
        value: '0.5mg',
        description: 'Standard dose',
        allowOneTimePurchase: false,
      },
      {
        id: 103,
        value: '1.0mg',
        description: 'Higher dose',
        allowOneTimePurchase: false,
      },
    ],
  },
  {
    id: 2,
    name: 'Tirzepatide',
    type: 'medication',
    contentType: 'product',
    description: 'Weekly dual GIP/GLP-1 receptor agonist',
    category: 'weight-management',
    requiresPrescription: true,
    oneTimePurchasePrice: 299.99,
    doses: [
      {
        id: 201,
        value: '5mg',
        description: 'Standard dose',
        allowOneTimePurchase: false,
      },
      {
        id: 202,
        value: '10mg',
        description: 'Higher dose',
        allowOneTimePurchase: false,
      },
    ],
  },
  {
    id: 3,
    name: 'Vitamin D3 Supplement',
    type: 'supplement',
    contentType: 'product',
    description: 'High-potency Vitamin D3',
    category: 'supplements',
    requiresPrescription: false,
    price: 19.99,
    allowOneTimePurchase: true,
  },
];

// Mock programs data
const mockPrograms = [
  {
    id: 101,
    name: 'Weight Management Program',
    contentType: 'program',
    description: 'A comprehensive 12-week weight management program with personalized coaching',
    category: 'weight-management',
    price: 149.99,
    duration: '12 weeks',
    features: ['Weekly coaching sessions', 'Personalized meal plans', 'Exercise routines', 'Progress tracking'],
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop',
  },
  {
    id: 102,
    name: 'Nutrition Masterclass',
    contentType: 'program',
    description: 'Learn the fundamentals of nutrition and build healthy eating habits',
    category: 'nutrition',
    price: 89.99,
    duration: '8 weeks',
    features: ['Video lessons', 'Recipe guides', 'Nutrition planning tools', 'Community support'],
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop',
  },
  {
    id: 103,
    name: 'Sleep Improvement Course',
    contentType: 'program',
    description: 'Science-backed techniques to improve your sleep quality',
    category: 'better-sleep',
    price: 69.99,
    duration: '4 weeks',
    features: ['Sleep tracking', 'Bedtime routines', 'Relaxation techniques', 'Expert guidance'],
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop',
  },
];

// Mock subscription plans data
const mockSubscriptionPlans = [
  {
    id: 201,
    name: 'Weight Loss Complete Plan',
    contentType: 'subscription',
    description: 'Comprehensive weight loss plan including medication, coaching, and support',
    category: 'weight-management',
    price: 149.99,
    billingFrequency: 'monthly',
    features: ['Monthly medication delivery', 'Weekly check-ins', 'Personalized meal plans', 'Progress tracking'],
  },
  {
    id: 202,
    name: 'Hair Loss Treatment',
    contentType: 'subscription',
    description: 'Ongoing treatment for hair loss with regular consultations',
    category: 'hair-loss',
    price: 99.99,
    billingFrequency: 'monthly',
    features: ['Prescribed medications', 'Quarterly check-ins', 'Progress monitoring', 'Treatment adjustments'],
  },
  {
    id: 203,
    name: 'Skin Care Essentials',
    contentType: 'subscription',
    description: 'Regular skincare products and dermatologist consultations',
    category: 'skin-care',
    price: 79.99,
    billingFrequency: 'monthly',
    features: ['Personalized skin care products', 'Quarterly consultations', 'Skin analysis', 'Seasonal adjustments'],
  },
];

// Combined content for the marketplace
const allMarketplaceContent = [
  ...mockProducts,
  ...mockPrograms,
  ...mockSubscriptionPlans,
];

// Content Card Component that handles all types of content
const ContentCard = ({ item, onAddToCart }) => {
  const [selectedDoseId, setSelectedDoseId] = useState(
    item.type === 'medication' && item.doses?.length > 0
      ? item.doses[0].id
      : null
  );
  const [addedToCartFeedbackId, setAddedToCartFeedbackId] = useState(null);

  // Get the currently selected dose object (for medications)
  const selectedDose =
    item.type === 'medication'
      ? item.doses?.find((d) => d.id === selectedDoseId)
      : null;

  // Determine if the currently selected item/dose can be purchased one-time
  const isOneTimePurchaseAllowed = () => {
    if (item.type === 'medication') {
      return !!selectedDose?.allowOneTimePurchase;
    } else if (item.contentType === 'product') {
      return !!item.allowOneTimePurchase;
    } else if (item.contentType === 'program') {
      return true; // Programs can be purchased one-time
    }
    return false; // Subscriptions cannot be purchased one-time
  };

  const handleAddToCartClick = () => {
    // Prescription check for medications
    if (item.requiresPrescription) {
      message.warning(`"${item.name}" requires a prescription.`);
      return;
    }
    
    // One-time purchase check
    if (!isOneTimePurchaseAllowed()) {
      message.warning(
        `"${item.name}${selectedDose ? ` (${selectedDose.value})` : ''}" is only available via subscription.`
      );
      return;
    }

    let cartItemData;
    
    if (item.contentType === 'product' && item.type === 'medication') {
      // Handle medications with doses
      if (selectedDose) {
        cartItemData = {
          id: selectedDose.id,
          value: selectedDose.value,
          price: item.oneTimePurchasePrice,
        };
        onAddToCart(item, cartItemData);
        setAddedToCartFeedbackId(selectedDose.id);
      }
    } else if (item.contentType === 'product') {
      // Handle non-medication products
      cartItemData = {
        id: `product-${item.id}`,
        value: 'Standard',
        price: item.price,
      };
      onAddToCart(item, cartItemData);
      setAddedToCartFeedbackId(`product-${item.id}`);
    } else if (item.contentType === 'program') {
      // Handle programs
      cartItemData = {
        id: `program-${item.id}`,
        value: item.duration,
        price: item.price,
      };
      onAddToCart(item, cartItemData);
      setAddedToCartFeedbackId(`program-${item.id}`);
    }
    
    // Reset feedback after delay
    setTimeout(() => setAddedToCartFeedbackId(null), 1500);
  };

  // Get the display price
  const getDisplayPrice = () => {
    if (item.contentType === 'product' && item.type === 'medication') {
      return item.oneTimePurchasePrice;
    } else if (item.contentType === 'subscription') {
      return `${item.price} / ${item.billingFrequency}`;
    }
    return item.price;
  };

  // Different card layouts based on content type
  const renderCardContent = () => {
    if (item.contentType === 'product') {
      return renderProductCard();
    } else if (item.contentType === 'program') {
      return renderProgramCard();
    } else if (item.contentType === 'subscription') {
      return renderSubscriptionCard();
    }
    return null;
  };

  // Product card layout
  const renderProductCard = () => {
    const displayPrice = getDisplayPrice();
    const currentFeedbackId = item.type === 'medication' ? selectedDoseId : `product-${item.id}`;
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col h-full">
        {/* Placeholder for image */}
        <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">
          <Package size={48} />
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {item.name}
              </h3>
              {item.requiresPrescription && (
                <span
                  title="Requires Prescription"
                  className="ml-2 text-blue-600 flex items-center text-xs bg-blue-100 px-1.5 py-0.5 rounded"
                >
                  <FileText size={12} className="mr-1" /> Rx
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
              {item.category?.replace('-', ' ') || 'General'}
            </span>
          </div>

          <div className="mt-4">
            {item.type === 'medication' && item.doses?.length > 0 ? (
              <div className="mb-3">
                <label
                  htmlFor={`dose-${item.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Dose:
                </label>
                <select
                  id={`dose-${item.id}`}
                  value={selectedDoseId ?? ''}
                  onChange={(e) => setSelectedDoseId(Number(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {item.doses.map((dose) => (
                    <option key={dose.id} value={dose.id}>
                      {dose.value}{' '}
                      {dose.allowOneTimePurchase ? '' : '(Subscription Only)'}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="flex justify-between items-center mb-3">
              <p className="text-xl font-bold text-gray-900">
                {displayPrice !== undefined
                  ? `$${typeof displayPrice === 'number' ? displayPrice.toFixed(2) : displayPrice}`
                  : 'N/A'}
                {item.type === 'medication' && (
                  <span className="text-sm font-normal text-gray-500">
                    {' '}
                    / one-time
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={handleAddToCartClick}
              disabled={
                item.requiresPrescription ||
                !isOneTimePurchaseAllowed() ||
                (item.type === 'medication' && !selectedDoseId)
              }
              title={
                item.requiresPrescription
                  ? 'Requires prescription.'
                  : !isOneTimePurchaseAllowed()
                    ? 'This option is subscription only.'
                    : ''
              }
              className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-150 ease-in-out ${
                addedToCartFeedbackId === currentFeedbackId
                  ? 'bg-green-500 text-white'
                  : 'bg-accent3 text-white hover:bg-accent3/90 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-gray-600'
              }`}
            >
              {addedToCartFeedbackId === currentFeedbackId ? (
                <>
                  <CheckCircle size={18} className="mr-2" /> Added
                </>
              ) : item.requiresPrescription ? (
                <>
                  <FileText size={18} className="mr-2" /> Requires Rx
                </>
              ) : !isOneTimePurchaseAllowed() ? (
                <>Subscription Only</>
              ) : (
                <>
                  <PlusCircle size={18} className="mr-2" /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Program card layout
  const renderProgramCard = () => {
    const displayPrice = getDisplayPrice();
    const currentFeedbackId = `program-${item.id}`;
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col h-full">
        {/* Program image */}
        <div 
          className="h-40 bg-cover bg-center" 
          style={{ backgroundImage: `url(${item.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop'})` }}
        />
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {item.name}
              </h3>
              <span
                title="Program Duration"
                className="ml-2 text-purple-600 flex items-center text-xs bg-purple-100 px-1.5 py-0.5 rounded"
              >
                <Calendar size={12} className="mr-1" /> {item.duration}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
              {item.category?.replace('-', ' ') || 'General'}
            </span>
            
            {/* Features list */}
            {item.features && item.features.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Includes:</p>
                <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                  {item.features.slice(0, 3).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                  {item.features.length > 3 && (
                    <li>+{item.features.length - 3} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xl font-bold text-gray-900">
                ${typeof displayPrice === 'number' ? displayPrice.toFixed(2) : displayPrice}
              </p>
            </div>

            <button
              onClick={handleAddToCartClick}
              className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-150 ease-in-out ${
                addedToCartFeedbackId === currentFeedbackId
                  ? 'bg-green-500 text-white'
                  : 'bg-accent4 text-white hover:bg-accent4/90'
              }`}
            >
              {addedToCartFeedbackId === currentFeedbackId ? (
                <>
                  <CheckCircle size={18} className="mr-2" /> Added
                </>
              ) : (
                <>
                  <BookOpen size={18} className="mr-2" /> Enroll Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Subscription card layout
  const renderSubscriptionCard = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col h-full">
        <div className="bg-gradient-to-r from-accent2/30 to-accent4/30 h-20 flex items-center justify-center">
          <div className="text-center">
            <Tag className="h-10 w-10 text-accent2" />
          </div>
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {item.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
              {item.category?.replace('-', ' ') || 'General'}
            </span>
            
            {/* Features list */}
            {item.features && item.features.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Includes:</p>
                <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                  {item.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xl font-bold text-gray-900">
                ${item.price.toFixed(2)}
                <span className="text-sm font-normal text-gray-500">
                  {' '}
                  / {item.billingFrequency}
                </span>
              </p>
            </div>

            <button
              className="w-full px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-150 ease-in-out bg-primary text-white hover:bg-primary/90"
            >
              <Calendar size={18} className="mr-2" /> Subscribe
            </button>
          </div>
        </div>
      </div>
    );
  };

  return renderCardContent();
};

const MarketplacePage = () => {
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const { addItem } = useCart();
  const { TabPane } = Tabs;

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMarketplaceItems(allMarketplaceContent);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddToCart = (item, itemDetails) => {
    // Add item to cart
    addItem(item, itemDetails, 1);
    
    // Different success messages based on content type
    if (item.contentType === 'product') {
      message.success(`${item.name} (${itemDetails.value}) added to cart!`);
    } else if (item.contentType === 'program') {
      message.success(`Program: ${item.name} added to cart!`);
    }
  };

  // Filter logic
  const filteredItems = marketplaceItems.filter((item) => {
    const nameMatch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const descMatch =
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    const matchesSearch = nameMatch || descMatch;
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    const matchesContentType =
      contentTypeFilter === 'all' || item.contentType === contentTypeFilter;
    
    return matchesSearch && matchesCategory && matchesContentType;
  });

  // Extract unique categories for filter dropdown
  const categories = [
    'all',
    ...new Set(marketplaceItems.map((p) => p.category).filter(Boolean)),
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading marketplace items...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="scribble" color="accent2" position="top-right" size={150} rotation={-10} opacity={0.1} />
      <ChildishDrawingElement type="watercolor" color="accent1" position="bottom-left" size={180} rotation={20} opacity={0.15} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-sm font-handwritten text-accent2 mt-1">Explore products, programs, and subscription plans</p>
      </div>

      {/* Main Tabs for Content Types */}
      <Tabs 
        defaultActiveKey="all" 
        onChange={(key) => setContentTypeFilter(key)}
        className="mb-6"
      >
        <TabPane tab="All Items" key="all" />
        <TabPane tab="Products" key="product" />
        <TabPane tab="Programs" key="program" />
        <TabPane tab="Subscription Plans" key="subscription" />
      </Tabs>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search marketplace..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all'
                  ? 'All Categories'
                  : category
                      .replace('-', ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto pb-2 mb-6 no-scrollbar">
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${categoryFilter === 'all' ? 'bg-accent2 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setCategoryFilter('all')}
          >
            All Categories
          </button>
          <button 
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${categoryFilter === 'weight-management' ? 'bg-accent2 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setCategoryFilter('weight-management')}
          >
            Weight Management
          </button>
          <button 
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${categoryFilter === 'nutrition' ? 'bg-accent2 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setCategoryFilter('nutrition')}
          >
            Nutrition
          </button>
          <button 
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${categoryFilter === 'hair-loss' ? 'bg-accent2 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setCategoryFilter('hair-loss')}
          >
            Hair Loss
          </button>
          <button 
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${categoryFilter === 'better-sleep' ? 'bg-accent2 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setCategoryFilter('better-sleep')}
          >
            Better Sleep
          </button>
          <button 
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${categoryFilter === 'skin-care' ? 'bg-accent2 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setCategoryFilter('skin-care')}
          >
            Skin Care
          </button>
          <button 
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${categoryFilter === 'supplements' ? 'bg-accent2 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setCategoryFilter('supplements')}
          >
            Supplements
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ContentCard
              key={`${item.contentType}-${item.id}`}
              item={item}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            No items found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;