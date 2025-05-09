import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, Plus, Trash2, Edit, ChevronRight, 
  Shield // Removed unused Check, X, AlertCircle, ArrowRight
} from 'lucide-react';
import ChildishDrawingElement from '../../components/ui/ChildishDrawingElement';

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: 'card-1',
    type: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2026,
    name: 'John Doe',
    isDefault: true
  },
  {
    id: 'card-2',
    type: 'mastercard',
    last4: '5555',
    expMonth: 8,
    expYear: 2025,
    name: 'John Doe',
    isDefault: false
  }
];

// Card Type Icon Component
const CardTypeIcon = ({ type }) => {
  switch (type.toLowerCase()) {
    case 'visa':
      return <div className="text-blue-600 font-bold text-sm">VISA</div>;
    case 'mastercard':
      return <div className="text-red-600 font-bold text-sm">MC</div>;
    case 'amex':
      return <div className="text-blue-800 font-bold text-sm">AMEX</div>;
    case 'discover':
      return <div className="text-orange-600 font-bold text-sm">DISC</div>;
    default:
      return <CreditCard className="h-5 w-5 text-gray-600" />;
  }
};

// Payment Method Card Component
const PaymentMethodCard = ({ method, onSetDefault, onEdit, onDelete }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${method.isDefault ? 'border-primary' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <CardTypeIcon type={method.type} />
          <div>
            <p className="font-medium">•••• {method.last4}</p>
            <p className="text-sm text-gray-500">Expires {method.expMonth}/{method.expYear}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {method.isDefault ? (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Default</span>
          ) : (
            <button 
              onClick={() => onSetDefault(method.id)} 
              className="text-xs text-accent3 hover:underline"
            >
              Set as default
            </button>
          )}
          <button 
            onClick={() => onEdit(method.id)} 
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(method.id)} 
            className="p-1 text-gray-500 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add New Card Form Component
const AddCardForm = ({ onCancel, onAdd }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would validate and process the card
    onAdd({
      type: 'visa', // This would be determined by the card number
      last4: cardNumber.slice(-4),
      expMonth: expiry.split('/')[0],
      expYear: '20' + expiry.split('/')[1],
      name,
      isDefault: makeDefault
    });
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    
    return v;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-accent3">
      <h3 className="text-lg font-semibold mb-4">Add New Payment Method</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
              maxLength="19"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                id="expiry"
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
                maxLength="5"
                required
              />
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                id="cvc"
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
                maxLength="4"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name on Card
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent3"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="makeDefault"
              type="checkbox"
              checked={makeDefault}
              onChange={(e) => setMakeDefault(e.target.checked)}
              className="h-4 w-4 text-accent3 focus:ring-accent3 border-gray-300 rounded"
            />
            <label htmlFor="makeDefault" className="ml-2 block text-sm text-gray-700">
              Make this my default payment method
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-accent3 text-white rounded-md hover:bg-accent3/90"
            >
              Add Card
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Main Payment Methods Page Component
const PaymentMethodsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle setting a payment method as default
  const handleSetDefault = (id) => {
    setPaymentMethods(
      paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  // Handle editing a payment method (in a real app, this would open a form)
  const handleEdit = (id) => {
    alert(`Edit payment method ${id}`);
  };

  // Handle deleting a payment method
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  // Handle adding a new payment method
  const handleAddCard = (newCard) => {
    // In a real app, you would send this to your backend
    const newMethod = {
      id: `card-${Date.now()}`,
      ...newCard
    };
    
    // If this is set as default, update all other cards
    if (newCard.isDefault) {
      setPaymentMethods(
        [...paymentMethods.map(method => ({
          ...method,
          isDefault: false
        })), newMethod]
      );
    } else {
      setPaymentMethods([...paymentMethods, newMethod]);
    }
    
    setShowAddForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 relative overflow-hidden pb-10">
      {/* Decorative elements */}
      <ChildishDrawingElement type="doodle" color="accent1" position="top-right" size={150} rotation={-15} opacity={0.15} />
      <ChildishDrawingElement type="scribble" color="primary" position="bottom-left" size={120} rotation={10} opacity={0.1} />
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
        <p className="text-sm font-handwritten text-primary mt-1">Manage your cards securely</p>
      </div>
      
      {/* Add Button */}
      <div className="mb-6 flex justify-end">
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)} 
            className="inline-flex items-center px-4 py-2 bg-accent3 text-white rounded-md text-sm font-medium hover:bg-accent3/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Payment Method
          </button>
        )}
      </div>
      
      {/* Main content */}
      <div className="space-y-6">
        {/* Security notice */}
        <div className="bg-accent2/10 rounded-lg p-4 mb-6 flex items-start">
          <Shield className="h-5 w-5 text-accent2 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-accent2">Secure Payment Processing</h3>
            <p className="text-sm text-gray-700">Your payment information is encrypted and securely stored. We never store your full card details on our servers.</p>
          </div>
        </div>
        
        {/* Add new card form */}
        {showAddForm && (
          <div className="mb-6">
            <AddCardForm 
              onCancel={() => setShowAddForm(false)} 
              onAdd={handleAddCard} 
            />
          </div>
        )}
        
        {/* Existing payment methods */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Payment Methods</h2>
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map(method => (
                <PaymentMethodCard 
                  key={method.id}
                  method={method}
                  onSetDefault={handleSetDefault}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">You don't have any payment methods yet.</p>
              {!showAddForm && (
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="mt-4 px-4 py-2 bg-accent3 text-white rounded-md hover:bg-accent3/90"
                >
                  Add Your First Card
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Billing history link */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <Link 
            to="/billing" 
            className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md"
          >
            <div className="flex items-center">
              <div className="bg-accent4/10 p-2 rounded-full mr-3">
                <CreditCard className="h-5 w-5 text-accent4" />
              </div>
              <div>
                <h3 className="font-medium">Billing History</h3>
                <p className="text-sm text-gray-500">View your past invoices and subscription details</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsPage;
