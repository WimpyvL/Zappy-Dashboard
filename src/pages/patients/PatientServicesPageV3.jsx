import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FileText, Shield, Plus, ChevronRight, 
  Calendar, MessageSquare, Pill, ClipboardList,
  Info, ShoppingBag, TrendingUp, Heart, Check
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import redesigned components
import TabNavigation from '../../components/ui/redesign/TabNavigation';
import TreatmentCard from '../../components/ui/redesign/TreatmentCard';
import PriorityActionCard from '../../components/ui/redesign/PriorityActionCard';
import BottomNavigation from '../../components/ui/redesign/BottomNavigation';
import ReferralBanner from '../../components/ui/redesign/ReferralBanner';
import ProductCard from '../../components/ui/redesign/ProductCard';

const PatientServicesPageV3 = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: '',
  });
  const [activeTab, setActiveTab] = useState('treatments'); // 'treatments' or 'notes'
  
  // Get current time of day for greeting
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);
  
  // Handle adding product to cart
  const handleAddProduct = (product) => {
    toast.success(`${product.name} added to cart`);
  };
  
  // Handle check-in button click
  const handleCheckIn = (treatmentType) => {
    toast.success(`Check-in initiated for ${treatmentType} treatment`);
  };
  
  // Handle message provider button click
  const handleMessageProvider = (treatmentType) => {
    navigate('/messaging');
    toast.info(`Messaging provider about ${treatmentType} treatment`);
  };
  
  // Handle referral button click
  const handleReferral = () => {
    toast.info('Referral link copied to clipboard!');
  };
  
  // Function to handle showing a modal
  const showModal = (modalId) => {
    // Set modal content based on modalId
    let title = '';
    let content = '';
    
    switch (modalId) {
      case 'weight-instructions':
        title = 'Weight Management Instructions';
        content = (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-sm mb-1">Dosage Instructions</h4>
              <p className="text-sm text-gray-600">Inject 0.5mg once weekly, on the same day each week.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Storage</h4>
              <p className="text-sm text-gray-600">Store in refrigerator (36°F to 46°F). Do not freeze.</p>
            </div>
          </div>
        );
        break;
      case 'hair-instructions':
        title = 'Hair Loss Treatment Instructions';
        content = (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-sm mb-1">Dosage Instructions</h4>
              <p className="text-sm text-gray-600">Take one 1mg tablet daily with or without food.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Storage</h4>
              <p className="text-sm text-gray-600">Store at room temperature away from moisture and heat.</p>
            </div>
          </div>
        );
        break;
      case 'subscription-details':
        title = 'Subscription Details';
        content = (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-sm mb-1">Current Plan</h4>
              <p className="text-sm text-gray-600">Weight Management & Hair Loss Bundle</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Next Payment</h4>
              <p className="text-sm text-gray-600">May 15, 2025 - $129.99</p>
            </div>
            <div className="pt-6 flex gap-4">
              <button 
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium"
                onClick={() => {
                  closeModal();
                  navigate('/patients/subscription');
                }}
              >
                Manage Subscription
              </button>
              <button 
                className="flex-1 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                onClick={() => {
                  closeModal();
                  navigate('/marketplace');
                }}
              >
                Add Products
              </button>
            </div>
          </div>
        );
        break;
      default:
        title = 'Information';
        content = <p className="text-sm text-gray-600">No additional information available.</p>;
    }
    
    // Update modal content and open it
    setModalContent({ title, content });
    setModalOpen(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Welcome Banner */}
      <section className="px-6 pt-4 pb-1">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">{greeting}, {user?.first_name || 'James'}</h2>
        </div>
        <p className="text-sm text-[#2D7FF9] font-medium mb-3">The support you need, when you need it.</p>
      </section>
      
      {/* Priority Action Card */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <PriorityActionCard
          title="Take your meds today"
          description="Semaglutide - due by 8:00 PM"
          actionText="Mark Done"
          onAction={() => toast.success('Medication marked as taken!')}
          icon={
            <div className="w-8 h-8 rounded-full bg-[#FFD100] flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
          }
        />
      </div>
      
      {/* Main Toggle Tabs */}
      <div className="max-w-4xl mx-auto px-6">
        <TabNavigation
          tabs={[
            { id: 'treatments', label: 'Treatments', icon: <Pill className="h-4 w-4" /> },
            { id: 'notes', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
            { id: 'insights', label: 'Insights', icon: <Info className="h-4 w-4" /> }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-4 space-y-8">
        {/* Treatments Tab Content */}
        {activeTab === 'treatments' && (
          <>
            {/* Weight Management Section */}
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-4 text-[#2D7FF9]">Weight Management</h2>
              
              {/* Medication Card */}
              <TreatmentCard
                type="weight"
                title="Semaglutide 0.5mg"
                subtitle="Weekly injection for weight management"
                status="active"
                nextTask={{
                  title: "Next dose: Today by 8:00 PM",
                  description: "Take your medication on time for best results"
                }}
                details={[
                  { label: "Dosage", value: "0.5mg weekly injection" },
                  { label: "Storage", value: "Refrigerate (36-46°F)" },
                  { label: "Progress", value: "-8 lbs in 5 weeks" }
                ]}
                primaryAction={{
                  text: "Check-in",
                  onClick: () => handleCheckIn('weight')
                }}
                secondaryAction={{
                  text: "Message",
                  onClick: () => handleMessageProvider('weight')
                }}
                resourceLinks={[
                  {
                    icon: <FileText className="h-4 w-4 text-blue-600" />,
                    text: "Medication Guide",
                    onClick: () => showModal('weight-instructions')
                  },
                  {
                    icon: <Calendar className="h-4 w-4 text-green-600" />,
                    text: "Subscription Details",
                    onClick: () => showModal('subscription-details')
                  }
                ]}
              />
              
              {/* Provider Recommendation (Cross-sell) */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-blue-600 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2" /> Provider Recommended
                </h3>
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4 pb-2 snap-x snap-mandatory">
                    {/* Product 1 */}
                    <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start">
                      <div className="h-32 bg-gray-100 flex items-center justify-center">
                        <img 
                          src="https://images.unsplash.com/photo-1577174881658-0f30ed549adc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                          alt="Nutritional Supplement" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm">Nutritional Supplement</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">Daily vitamin supplement to support your weight management journey</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium">$29.99</span>
                          <button 
                            className="text-xs text-white px-2 py-1 rounded-full bg-blue-600"
                            onClick={() => handleAddProduct({name: 'Nutritional Supplement'})}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product 2 */}
                    <div className="w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start">
                      <div className="h-32 bg-gray-100 flex items-center justify-center">
                        <img 
                          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                          alt="Fiber Supplement" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm">Fiber Supplement</h4>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">Improves fullness & digestive health</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium">$19.99</span>
                          <button 
                            className="text-xs text-white px-2 py-1 rounded-full bg-blue-600"
                            onClick={() => handleAddProduct({name: 'Fiber Supplement'})}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Hair Loss Treatment Section */}
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-4 text-[#2D7FF9]">Hair Loss Treatment</h2>
              
              {/* Medication Card */}
              <TreatmentCard
                type="hair"
                title="Finasteride 1mg"
                subtitle="Daily tablet for hair loss treatment"
                status="active"
                nextTask={{
                  title: "Next task: Take progress photos by May 10",
                  description: "Document your progress for better results tracking"
                }}
                details={[
                  { label: "Dosage", value: "1mg daily tablet" },
                  { label: "Duration", value: "3 months, 2 weeks" }
                ]}
                primaryAction={{
                  text: "Take Photos",
                  onClick: () => navigate('/patients/progress-photos')
                }}
                secondaryAction={{
                  text: "Message",
                  onClick: () => handleMessageProvider('hair')
                }}
                resourceLinks={[
                  {
                    icon: <FileText className="h-4 w-4 text-purple-600" />,
                    text: "Medication Guide",
                    onClick: () => showModal('hair-instructions')
                  },
                  {
                    icon: <MessageSquare className="h-4 w-4 text-indigo-600" />,
                    text: "Message Provider",
                    onClick: () => navigate('/messaging')
                  }
                ]}
              />
            </section>
            
            {/* Referral Banner */}
            <section className="mb-10">
              <ReferralBanner
                title="Share with a buddy, get $20 credit"
                subtitle="Invite friends to join Zappy Health."
                buttonText="Invite"
                onButtonClick={handleReferral}
                referralCount={3}
                icon={
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <Plus className="h-5 w-5 text-[#2D7FF9]" />
                  </div>
                }
              />
            </section>
            
            {/* Popular Treatments Section */}
            <section className="mb-10">
              <h2 className="text-lg font-bold mb-4 text-[#10b981] flex items-center">
                Popular Treatments <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
              </h2>
              
              <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4 pb-2 snap-x snap-mandatory">
                  {/* Product Card 1 */}
                  <div className="w-40 flex-shrink-0 snap-start">
                    <ProductCard
                      title="Tirzepatide"
                      description="New weight management medication with dual hormone action"
                      imageUrl="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      price={199.99}
                      originalPrice={249.99}
                      badge="New"
                      badgeVariant="success"
                      tag="Weight"
                      tagVariant="weight"
                      onAddToCart={() => handleAddProduct({name: 'Tirzepatide'})}
                      onViewDetails={() => navigate('/marketplace/tirzepatide')}
                    />
                  </div>
                  
                  {/* Product Card 2 */}
                  <div className="w-40 flex-shrink-0 snap-start">
                    <ProductCard
                      title="Dutasteride"
                      description="Advanced hair loss treatment targeting both types of DHT"
                      imageUrl="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      price={89.99}
                      badge="Popular"
                      badgeVariant="warning"
                      tag="Hair"
                      tagVariant="hair"
                      onAddToCart={() => handleAddProduct({name: 'Dutasteride'})}
                      onViewDetails={() => navigate('/marketplace/dutasteride')}
                    />
                  </div>
                  
                  {/* Product Card 3 */}
                  <div className="w-40 flex-shrink-0 snap-start">
                    <ProductCard
                      title="Liraglutide"
                      description="Daily injection for weight management with proven results"
                      imageUrl="https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      price={149.99}
                      originalPrice={179.99}
                      badge="Trending"
                      badgeVariant="info"
                      tag="Weight"
                      tagVariant="weight"
                      onAddToCart={() => handleAddProduct({name: 'Liraglutide'})}
                      onViewDetails={() => navigate('/marketplace/liraglutide')}
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
        
        {/* Medical Notes Tab Content */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 mb-6">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Medical Notes</h3>
                <p className="text-sm text-gray-600">Treatment notes and observations from your healthcare provider</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Request Note
              </button>
            </div>
            
            <div className="p-5">
              {/* Filter/Sort Options */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    All Notes
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    Weight Management
                  </button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    Hair Loss
                  </button>
                </div>
                <div>
                  <select className="text-xs border border-gray-300 rounded-md px-2 py-1">
                    <option>Most Recent</option>
                    <option>Oldest First</option>
                    <option>By Treatment</option>
                  </select>
                </div>
              </div>
              
              {/* Notes organized by date */}
              <div className="space-y-4">
                {/* Note 1 */}
                <div className="border-l-4 border-blue-500 pl-3 py-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Weight Management - Semaglutide</h4>
                    <span className="text-xs text-gray-500">April 28, 2025</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">Patient reports mild nausea after injection. Recommended taking medication after light meal to reduce side effects. Follow up in 2 weeks to assess if symptoms persist.</p>
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <span className="text-blue-600 text-xs font-bold">DS</span>
                    </div>
                    Dr. Sarah Smith
                  </div>
                </div>
                
                {/* Note 2 */}
                <div className="border-l-4 border-purple-500 pl-3 py-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">Hair Loss Treatment - Finasteride</h4>
                    <span className="text-xs text-gray-500">April 15, 2025</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">No side effects reported. Patient showing early signs of response after 3 months of treatment. Recommended continuing current dosage and scheduling follow-up in 3 months for progress photos.</p>
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                      <span className="text-purple-600 text-xs font-bold">MJ</span>
                    </div>
                    Dr. Michael Johnson
                  </div>
                </div>
              </div>
              
              {/* Pagination */}
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center space-x-1">
                  <button className="px-2 py-1 text-sm rounded-md text-gray-500 hover:bg-gray-100">
                    <ChevronRight className="h-4 w-4 transform rotate-180" />
                  </button>
                  <button className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white">1</button>
                  <button className="px-3 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100">2</button>
                  <button className="px-3 py-1 text-sm rounded-md text-gray-700 hover:bg-gray-100">3</button>
                  <button className="px-2 py-1 text-sm rounded-md text-gray-500 hover:bg-gray-100">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal for showing details */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalContent.title}
      >
        {modalContent.content}
      </Modal>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activePage="care"
        notifications={{
          home: 0,
          care: 2,
          programs: 0,
          shop: 0,
          learn: 1
        }}
      />
    </div>
  );
};

export default PatientServicesPageV3;
