import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import {
  Package,
  Search,
  Filter,
  PlusCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { message } from 'antd';

// Mock product data - Updated with allowOneTimePurchase flags and oneTimePurchasePrice
const mockProducts = [
  {
    id: 1,
    name: 'Semaglutide',
    type: 'medication',
    description: 'GLP-1 agonist for weight management',
    category: 'weight-management',
    requiresPrescription: true,
    oneTimePurchasePrice: 219.99, // Price for one-time purchase of any allowed dose
    doses: [
      // Price removed from doses
      {
        id: 101,
        value: '0.25mg',
        description: 'Starting dose',
        allowOneTimePurchase: true,
      }, // Trial dose allowed one-time
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
    description: 'Weekly dual GIP/GLP-1 receptor agonist',
    category: 'weight-management',
    requiresPrescription: true,
    oneTimePurchasePrice: 299.99,
    doses: [
      // Price removed from doses
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
    description: 'High-potency Vitamin D3',
    category: 'supplements',
    requiresPrescription: false,
    price: 19.99, // This is the one-time price for non-meds
    allowOneTimePurchase: true,
  },
];

const ProductCard = ({ product, onAddToCart }) => {
  const [selectedDoseId, setSelectedDoseId] = useState(
    product.type === 'medication' && product.doses?.length > 0
      ? product.doses[0].id
      : null
  );
  const [addedToCartFeedbackId, setAddedToCartFeedbackId] = useState(null); // Tracks feedback per dose/product ID

  // Get the currently selected dose object (for medications)
  const selectedDose =
    product.type === 'medication'
      ? product.doses?.find((d) => d.id === selectedDoseId)
      : null;

  // Determine if the currently selected item/dose can be purchased one-time
  const isOneTimePurchaseAllowed = () => {
    if (product.type === 'medication') {
      return !!selectedDose?.allowOneTimePurchase; // Check flag on the selected dose
    } else {
      return !!product.allowOneTimePurchase; // Check flag on the non-med product
    }
  };

  const handleAddToCartClick = () => {
    // --- Prescription Check ---
    if (product.requiresPrescription) {
      message.warning(`"${product.name}" requires a prescription.`);
      return;
    }
    // --- One-Time Purchase Check ---
    if (!isOneTimePurchaseAllowed()) {
      message.warning(
        `"${product.name}${selectedDose ? ` (${selectedDose.value})` : ''}" is only available via subscription.`
      );
      return;
    }

    if (product.type === 'medication') {
      if (selectedDose) {
        // Use the product's oneTimePurchasePrice, pass dose details for context
        if (product.oneTimePurchasePrice !== undefined) {
          const cartItemDoseData = {
            id: selectedDose.id, // Keep dose ID for uniqueness in cart
            value: selectedDose.value,
            price: product.oneTimePurchasePrice, // Use the product's one-time price
          };
          onAddToCart(product, cartItemDoseData); // Pass base product and specific dose data
          setAddedToCartFeedbackId(selectedDose.id); // Use dose ID for feedback tracking
          setTimeout(() => setAddedToCartFeedbackId(null), 1500);
        } else {
          message.error('Cannot add medication (missing one-time price).');
        }
      }
    } else {
      // Handle non-medication products (use product.price)
      if (product.price !== undefined) {
        // Use product ID as the unique identifier for feedback in this case
        const pseudoDoseData = {
          id: `product-${product.id}`,
          value: 'Standard',
          price: product.price,
        };
        onAddToCart(product, pseudoDoseData);
        setAddedToCartFeedbackId(`product-${product.id}`);
        setTimeout(() => setAddedToCartFeedbackId(null), 1500);
      } else {
        message.error('Product cannot be added (missing price).');
      }
    }
  };

  // Get the correct price to display (one-time price for meds, base price for others)
  const getDisplayPrice = () => {
    if (product.type === 'medication') {
      // Show the single one-time price from the product if available
      return product.oneTimePurchasePrice;
    }
    return product.price; // For non-meds
  };

  const displayPrice = getDisplayPrice();
  // Determine the correct ID for feedback tracking
  const currentFeedbackId =
    product.type === 'medication' ? selectedDoseId : `product-${product.id}`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col">
      {/* Placeholder for image */}
      <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">
        <Package size={48} />
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold text-gray-800">
              {product.name}
            </h3>
            {product.requiresPrescription && (
              <span
                title="Requires Prescription"
                className="ml-2 text-blue-600 flex items-center text-xs bg-blue-100 px-1.5 py-0.5 rounded"
              >
                <FileText size={12} className="mr-1" /> Rx
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
            {product.category?.replace('-', ' ') || 'General'}
          </span>
        </div>

        <div className="mt-4">
          {product.type === 'medication' && product.doses?.length > 0 ? (
            <div className="mb-3">
              <label
                htmlFor={`dose-${product.id}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Dose:
              </label>
              <select
                id={`dose-${product.id}`}
                value={selectedDoseId ?? ''}
                onChange={(e) => setSelectedDoseId(Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {/* Dose dropdown doesn't show price anymore */}
                {product.doses.map((dose) => (
                  <option key={dose.id} value={dose.id}>
                    {dose.value}{' '}
                    {dose.allowOneTimePurchase ? '' : '(Subscription Only)'}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex justify-between items-center mb-3">
            {/* Display the determined one-time price */}
            <p className="text-xl font-bold text-gray-900">
              {displayPrice !== undefined
                ? `$${displayPrice.toFixed(2)}`
                : 'N/A'}
              {product.type === 'medication' && (
                <span className="text-sm font-normal text-gray-500">
                  {' '}
                  / one-time
                </span>
              )}
            </p>
          </div>

          <button
            onClick={handleAddToCartClick}
            // Disable button logic
            disabled={
              product.requiresPrescription ||
              !isOneTimePurchaseAllowed() ||
              (product.type === 'medication' && !selectedDoseId)
            }
            title={
              product.requiresPrescription
                ? 'Requires prescription.'
                : !isOneTimePurchaseAllowed()
                  ? 'This option is subscription only.'
                  : ''
            }
            className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-150 ease-in-out ${
              // Feedback style logic
              addedToCartFeedbackId === currentFeedbackId
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-gray-600'
            }`}
          >
            {/* Button Text Logic */}
            {addedToCartFeedbackId === currentFeedbackId ? (
              <>
                <CheckCircle size={18} className="mr-2" /> Added
              </>
            ) : product.requiresPrescription ? (
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

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { addItem } = useCart();

  useEffect(() => {
    // Simulate API call - Replace with actual API fetch
    setTimeout(() => {
      // Ensure mock data includes the new fields
      const updatedMockProducts = mockProducts.map((p) => ({
        ...p,
        allowOneTimePurchase:
          p.allowOneTimePurchase !== undefined
            ? p.allowOneTimePurchase
            : p.type !== 'medication', // Default non-meds to true if undefined
        oneTimePurchasePrice:
          p.oneTimePurchasePrice !== undefined
            ? p.oneTimePurchasePrice
            : p.price, // Use price if oneTime is missing for meds
        doses:
          p.doses?.map((d) => ({
            ...d,
            allowOneTimePurchase:
              d.allowOneTimePurchase !== undefined
                ? d.allowOneTimePurchase
                : false, // Default doses to false if undefined
          })) || [],
      }));
      setProducts(updatedMockProducts);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddToCart = (product, doseDetails) => {
    // Pass product and dose details (which now includes the correct price)
    addItem(product, doseDetails, 1);
    message.success(`${product.name} (${doseDetails.value}) added to cart!`);
  };

  // Filter logic
  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const descMatch =
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    const matchesSearch = nameMatch || descMatch;
    const matchesCategory =
      categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter dropdown
  const categories = [
    'all',
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  if (loading) {
    return <div className="p-6 text-center">Loading products...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Products</h1>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
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

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">
            No products found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
