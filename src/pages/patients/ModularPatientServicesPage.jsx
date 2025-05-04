import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';

const ModularPatientServicesPage = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: '',
  });
  
  // Mock data for recommended products for weight management
  const weightProducts = [
    {
      id: 'wp1',
      name: 'Nutritional Supplement',
      description: 'Daily vitamin supplement to support your weight management journey',
      price: 29.99,
      recurring: true,
      imageUrl: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      isPopular: true
    },
    {
      id: 'wp2',
      name: 'Digital Scale',
      description: 'Smart scale that syncs with your account for easy weight tracking',
      price: 49.99,
      recurring: false,
      imageUrl: 'https://images.unsplash.com/photo-1535914254981-b5012eebbd15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    }
  ];
  
  // Mock data for recommended products for hair loss
  const hairProducts = [
    {
      id: 'hp1',
      name: 'Biotin Supplement',
      description: 'Supports healthy hair growth and strength',
      price: 24.99,
      recurring: true,
      imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      isPopular: true
    },
    {
      id: 'hp2',
      name: 'Scalp Massager',
      description: 'Stimulates blood flow to the scalp to promote hair growth',
      price: 19.99,
      recurring: false,
      imageUrl: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    }
  ];
  
  // Handle adding product to cart
  const handleAddProduct = (product) => {
    toast.success(`${product.name} added to cart`);
  };

  // Function to show modal
  const showModal = (type) => {
    let title = '';
    let content = '';

    switch (type) {
      case 'weight-plan':
        title = 'Weight Management Plan';
        content = <div>Weight Management Plan Details</div>;
        break;
      case 'hair-plan':
        title = 'Hair Loss Treatment Plan';
        content = <div>Hair Loss Treatment Plan Details</div>;
        break;
      default:
        title = 'Information';
        content = <p className="text-sm text-gray-600">No additional information available.</p>;
    }

    setModalContent({ title, content });
    setModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setModalOpen(false);
  };

  // Product Card Component
  const ProductCard = ({ product, colorClass }) => (
    <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden snap-start">
      <div className="h-40 bg-gray-100">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        {product.isPopular && (
          <div className="flex items-center mb-1">
            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">Popular</span>
          </div>
        )}
        <h4 className="font-medium text-sm">{product.name}</h4>
        <p className="text-xs text-gray-500 mb-2">{product.description}</p>
        <span className="text-xs font-medium">${product.price.toFixed(2)}{product.recurring && '/month'}</span>
        <button 
          className={`mt-2 w-full py-1 rounded text-xs font-medium bg-${colorClass} text-white`}
          onClick={() => handleAddProduct(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50">
      <PageHeader 
        title="My Health Services" 
        description="Manage all your health services in one place"
      />
      
      <div id="active-state" className="space-y-8">
        {/* Weight Management Category Module */}
        <div className="service-module bg-white rounded-xl shadow-md overflow-hidden border-l-4" style={{ borderLeftColor: '#F85C5C' }}>
          <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: '#FFF5F5' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#F85C5C' }}>Weight Management</h3>
          </div>
          <div className="p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-24 w-24 rounded-lg bg-gray-100">
                <img src="https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Semaglutide" className="w-full h-full object-cover" />
              </div>
              <div className="ml-5 flex-1">
                <h4 className="text-base font-medium">Semaglutide 0.5mg</h4>
                <p className="text-sm text-gray-500 mt-1">Weekly injection for weight management</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hair Loss Category Module */}
        <div className="service-module bg-white rounded-xl shadow-md overflow-hidden border-l-4" style={{ borderLeftColor: '#4F46E5' }}>
          <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: '#F5F7FF' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#4F46E5' }}>Hair Loss Treatment</h3>
          </div>
          <div className="p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-24 w-24 rounded-lg bg-gray-100">
                <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Finasteride" className="w-full h-full object-cover" />
              </div>
              <div className="ml-5 flex-1">
                <h4 className="text-base font-medium">Finasteride 1mg</h4>
                <p className="text-sm text-gray-500 mt-1">Daily tablet for hair loss treatment</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommended Products for Weight Management - Outside the service module */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold">Recommended Products for Weight Management</h3>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto -mx-4 px-4 product-scroll">
              <div className="flex space-x-4 pb-4 snap-x snap-mandatory">
                {weightProducts.map((product) => (
                  <div key={product.id} className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden snap-start">
                    <div className="h-40 bg-gray-100">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      {product.isPopular && (
                        <div className="flex items-center mb-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">Popular</span>
                        </div>
                      )}
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                      <span className="text-xs font-medium">${product.price.toFixed(2)}{product.recurring && '/month'}</span>
                      <button 
                        className="mt-2 w-full py-1 rounded text-xs font-medium bg-[#F85C5C] text-white"
                        onClick={() => handleAddProduct(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommended Products for Hair Loss - Outside the service module */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold">Recommended Products for Hair Loss</h3>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto -mx-4 px-4 product-scroll">
              <div className="flex space-x-4 pb-4 snap-x snap-mandatory">
                {hairProducts.map((product) => (
                  <div key={product.id} className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden snap-start">
                    <div className="h-40 bg-gray-100">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      {product.isPopular && (
                        <div className="flex items-center mb-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">Popular</span>
                        </div>
                      )}
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                      <span className="text-xs font-medium">${product.price.toFixed(2)}{product.recurring && '/month'}</span>
                      <button 
                        className="mt-2 w-full py-1 rounded text-xs font-medium bg-[#4F46E5] text-white"
                        onClick={() => handleAddProduct(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalContent.title}
      >
        {modalContent.content}
      </Modal>
    </div>
  );
};

export default ModularPatientServicesPage;
