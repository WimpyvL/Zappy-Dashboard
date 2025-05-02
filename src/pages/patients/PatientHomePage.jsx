import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Bell, User, Home, Calendar, FileText, ShoppingBag, 
  ArrowLeft, Share2, Info, Plus, ChevronRight, TrendingDown,
  CheckCircle, Shield, MessageSquare
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import PatientHomeResourcesSection from '../../components/patient/PatientHomeResourcesSection';

const PatientHomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('treatment');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    content: '',
  });
  
  // Mock data for the patient's treatment
  const mockData = {
    patient: {
      firstName: user?.first_name || 'James',
      lastName: user?.last_name || 'Smith'
    },
    medication: {
      name: 'Semaglutide 0.5mg',
      description: 'Weekly injection for weight management',
      status: 'Active',
      nextDose: 'Tomorrow at 9:00 AM',
      nextShipment: 'May 15, 2025',
      shipmentNote: 'After your scheduled check-in',
      progress: {
        current: 4,
        total: 24,
        percentage: 16
      }
    },
    recommendation: {
      name: 'Digestive Support',
      description: 'Dr. Johnson recommended this to help with GI side effects',
      price: 19,
      regularPrice: 24,
      imageUrl: 'https://via.placeholder.com/80'
    },
    treatmentPhase: {
      name: 'Dose Adjustment',
      description: "You're currently in the dose adjustment phase of your treatment.",
      nextCheckIn: 'May 15, 2025'
    },
    healthMetrics: {
      weight: {
        current: 183,
        change: -5,
        target: 170,
        progress: 40,
        unit: 'lbs'
      },
      bmi: {
        current: 28.3,
        change: -0.8,
        target: 24.9,
        progress: 30
      }
    },
    resources: [
      {
        id: 'medication-guide',
        title: 'Medication Guide',
        description: 'Dosage, storage, and instructions',
        icon: 'document',
        color: 'blue'
      },
      {
        id: 'side-effects',
        title: 'Side Effects Management',
        description: 'Common side effects and how to manage them',
        icon: 'warning',
        color: 'orange'
      },
      {
        id: 'diet-tips',
        title: 'Diet & Nutrition Tips',
        description: 'Optimize your diet while on medication',
        icon: 'shopping',
        color: 'green'
      }
    ],
    providerNotes: {
      provider: {
        name: 'Dr. Sarah Johnson',
        imageUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
        date: 'May 1, 2025'
      },
      note: 'James is responding well to the initial dose of semaglutide. We\'ve increased to 0.5mg weekly as planned. Patient reports mild nausea that resolves within 24 hours of injection. Continue to monitor weight loss progress and side effects.'
    },
    recommendedProducts: [
      {
        id: 'p1',
        name: 'Daily Multivitamin',
        description: 'Support your weight loss',
        price: 15,
        imageUrl: 'https://via.placeholder.com/144'
      },
      {
        id: 'p2',
        name: 'Protein Powder',
        description: 'Maintain muscle mass',
        price: 29,
        imageUrl: 'https://via.placeholder.com/144'
      },
      {
        id: 'p3',
        name: 'Electrolyte Drink',
        description: 'Stay hydrated',
        price: 24,
        isPopular: true,
        imageUrl: 'https://via.placeholder.com/144'
      },
      {
        id: 'p4',
        name: 'Fiber Supplement',
        description: 'Support digestion',
        price: 19,
        imageUrl: 'https://via.placeholder.com/144'
      }
    ],
    subscription: {
      name: 'Weight Management Plan',
      status: 'Active',
      startDate: 'April 2, 2025',
      nextPayment: 'May 2, 2025',
      price: 99,
      nextShipment: 'May 5, 2025',
      includes: [
        'Monthly supply of Semaglutide 0.5mg',
        'Unlimited messaging with your provider',
        'Quarterly virtual check-ins with healthcare provider',
        'Personalized nutrition and lifestyle guidance'
      ],
      details: {
        billingFrequency: 'Monthly',
        automaticRefills: 'Yes',
        freeShipping: 'Yes'
      },
      orders: [
        {
          id: 'ZP12345',
          status: 'Delivered',
          date: 'April 5, 2025',
          description: 'Semaglutide 0.5mg - 4 doses'
        },
        {
          id: 'ZP12265',
          status: 'Processed',
          date: 'March 5, 2025',
          description: 'Semaglutide 0.25mg - 4 doses'
        }
      ],
      paymentMethod: {
        type: 'Visa',
        last4: '4242',
        expiry: '09/27',
        isDefault: true
      },
      bundleSuggestions: [
        {
          id: 'b1',
          name: 'Fiber Supplement',
          description: 'Improves fullness + digestive health',
          price: 19
        },
        {
          id: 'b2',
          name: 'Electrolyte Drink Mix',
          description: 'Stay hydrated while losing weight',
          price: 24
        }
      ]
    }
  };
  
  // Function to handle showing a modal
  const showModal = (modalId) => {
    // Set modal content based on modalId
    let title = '';
    let content = '';
    
    switch (modalId) {
      case 'shipment-details':
        title = 'Shipment Details';
        content = (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Shipping Date</h4>
              <p className="text-sm text-gray-600">May 15, 2025</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Shipping Method</h4>
              <p className="text-sm text-gray-600">Express Delivery (1-2 business days)</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Tracking</h4>
              <p className="text-sm text-gray-600">Tracking information will be available once your order ships.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Contents</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Semaglutide 0.5mg - 4 doses</li>
                <li>Injection supplies</li>
                <li>Disposal container</li>
              </ul>
            </div>
          </div>
        );
        break;
      case 'medication-guide':
        title = 'Medication Guide';
        content = (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Dosage Instructions</h4>
              <p className="text-sm text-gray-600">Inject 0.5mg once weekly, on the same day each week. You can inject at any time of day, with or without food.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Storage</h4>
              <p className="text-sm text-gray-600">Store in refrigerator (36°F to 46°F). Do not freeze. May be kept at room temperature for up to 30 days.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Injection Sites</h4>
              <p className="text-sm text-gray-600">Abdomen, thigh, or upper arm. Rotate injection sites with each dose.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Missed Dose</h4>
              <p className="text-sm text-gray-600">If you miss a dose, take it as soon as possible within 5 days of the missed dose. If more than 5 days have passed, skip the missed dose and take your next dose on the regularly scheduled day.</p>
            </div>
          </div>
        );
        break;
      case 'report-issue':
        title = 'Report an Issue';
        content = (
          <div className="space-y-4">
            <div>
              <label htmlFor="issue-type" className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select id="issue-type" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>Side Effect</option>
                <option>Medication Question</option>
                <option>Delivery Problem</option>
                <option>Billing Issue</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="issue-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="issue-description" rows="4" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Please describe the issue..."></textarea>
            </div>
            <div>
              <label htmlFor="issue-urgency" className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input type="radio" name="urgency" value="low" className="text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Low</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="urgency" value="medium" className="text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Medium</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="urgency" value="high" className="text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">High</span>
                </label>
              </div>
            </div>
          </div>
        );
        break;
      case 'side-effects':
        title = 'Side Effects Management';
        content = (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Common Side Effects</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Nausea</li>
                <li>Diarrhea</li>
                <li>Vomiting</li>
                <li>Constipation</li>
                <li>Abdominal pain</li>
                <li>Headache</li>
                <li>Fatigue</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Managing Nausea</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Eat smaller, more frequent meals</li>
                <li>Avoid fatty or spicy foods</li>
                <li>Stay hydrated</li>
                <li>Try ginger tea or peppermint</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">When to Contact Your Provider</h4>
              <p className="text-sm text-gray-600">Contact your healthcare provider if you experience severe or persistent side effects, or if you have symptoms of an allergic reaction such as rash, itching, or difficulty breathing.</p>
            </div>
          </div>
        );
        break;
      case 'diet-tips':
        title = 'Diet & Nutrition Tips';
        content = (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Protein Recommendations</h4>
              <p className="text-sm text-gray-600">Aim for 1.2-1.6g of protein per kg of body weight daily to preserve muscle mass during weight loss.</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mt-2">
                <li>Lean meats (chicken, turkey)</li>
                <li>Fish and seafood</li>
                <li>Eggs</li>
                <li>Greek yogurt</li>
                <li>Legumes and tofu</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Hydration</h4>
              <p className="text-sm text-gray-600">Drink at least 2-3 liters of water daily. Proper hydration helps manage hunger and supports metabolism.</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Fiber Intake</h4>
              <p className="text-sm text-gray-600">Include plenty of fiber-rich foods to promote fullness and digestive health:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mt-2">
                <li>Vegetables</li>
                <li>Fruits</li>
                <li>Whole grains</li>
                <li>Beans and legumes</li>
              </ul>
            </div>
          </div>
        );
        break;
      case 'message-provider':
        title = 'Message Your Provider';
        content = (
          <div className="space-y-4">
            <div className="flex items-start mb-3">
              <img 
                src={mockData.providerNotes.provider.imageUrl} 
                alt="Provider" 
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h4 className="font-medium">{mockData.providerNotes.provider.name}</h4>
                <p className="text-xs text-gray-500">Typically responds within 24 hours</p>
              </div>
            </div>
            <div>
              <label htmlFor="message-subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input 
                type="text" 
                id="message-subject" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Brief description of your question"
              />
            </div>
            <div>
              <label htmlFor="message-body" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                id="message-body" 
                rows="5" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <div className="pt-4">
              <button 
                className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                onClick={() => {
                  closeModal();
                  toast.success("Message sent to Dr. Sarah Johnson");
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        );
        break;
      case 'schedule-checkin':
        title = 'Schedule Check-in';
        content = (
          <div className="space-y-4">
            <div>
              <label htmlFor="checkin-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                id="checkin-date" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                defaultValue="2025-05-15"
              />
            </div>
            <div>
              <label htmlFor="checkin-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input 
                type="time" 
                id="checkin-time" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                defaultValue="09:00"
              />
            </div>
            <div>
              <label htmlFor="checkin-type" className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
              <select id="checkin-type" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>Video Call</option>
                <option>Phone Call</option>
                <option>In-Person</option>
              </select>
            </div>
            <div>
              <label htmlFor="checkin-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea 
                id="checkin-notes" 
                rows="3" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Any specific topics you'd like to discuss..."
              ></textarea>
            </div>
            <div className="pt-4">
              <button 
                className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                onClick={() => {
                  closeModal();
                  toast.success("Check-in appointment scheduled for May 15, 2025 at 9:00 AM");
                }}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        );
        break;
      case 'order-details-ZP12345':
        title = 'Order Details';
        content = (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Order Number</h4>
              <p className="text-sm text-gray-600">ZP12345</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Order Date</h4>
              <p className="text-sm text-gray-600">April 5, 2025</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Status</h4>
              <p className="text-sm text-gray-600">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Delivered
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Items</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Semaglutide 0.5mg - 4 doses</li>
                <li>Injection supplies</li>
                <li>Disposal container</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Shipping Address</h4>
              <p className="text-sm text-gray-600">
                123 Main St<br />
                Apt 4B<br />
                San Francisco, CA 94105
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Tracking Information</h4>
              <p className="text-sm text-gray-600">
                Carrier: USPS<br />
                Tracking Number: 9400123456789012345678<br />
                <a href="#" className="text-blue-600 font-medium">View Tracking</a>
              </p>
            </div>
          </div>
        );
        break;
      case 'add-payment-method':
        title = 'Add Payment Method';
        content = (
          <div className="space-y-4">
            <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input 
                type="text" 
                id="card-number" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="text" 
                  id="expiry-date" 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label htmlFor="security-code" className="block text-sm font-medium text-gray-700 mb-1">Security Code</label>
                <input 
                  type="text" 
                  id="security-code" 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="CVC"
                />
              </div>
            </div>
            <div>
              <label htmlFor="name-on-card" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <input 
                type="text" 
                id="name-on-card" 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="John Smith"
              />
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="set-default" 
                className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                defaultChecked
              />
              <label htmlFor="set-default" className="text-sm text-gray-700">Set as default payment method</label>
            </div>
            <div className="pt-4">
              <button 
                className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                onClick={() => {
                  closeModal();
                  toast.success("Payment method added successfully");
                }}
              >
                Add Payment Method
              </button>
            </div>
          </div>
        );
        break;
      case 'order-details-ZP12265':
        title = 'Order Details';
        content = (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Order Number</h4>
              <p className="text-sm text-gray-600">ZP12265</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Order Date</h4>
              <p className="text-sm text-gray-600">March 5, 2025</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Status</h4>
              <p className="text-sm text-gray-600">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Processed
                </span>
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Items</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Semaglutide 0.25mg - 4 doses</li>
                <li>Injection supplies</li>
                <li>Disposal container</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Shipping Address</h4>
              <p className="text-sm text-gray-600">
                123 Main St<br />
                Apt 4B<br />
                San Francisco, CA 94105
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Tracking Information</h4>
              <p className="text-sm text-gray-600">
                Tracking information will be available once your order ships.
              </p>
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
    <div className="bg-gray-50 text-gray-900 pb-20">
      {/* Header removed - using the one from MainLayout */}
      
      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button 
            className={`whitespace-nowrap flex items-center justify-center px-5 py-3 font-medium text-sm relative min-h-[44px] min-w-[44px] ${
              activeTab === 'treatment' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('treatment')}
          >
            My Treatment
          </button>
          <button 
            className={`whitespace-nowrap flex items-center justify-center px-5 py-3 font-medium text-sm relative min-h-[44px] min-w-[44px] ${
              activeTab === 'subscription' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('subscription')}
          >
            My Subscription
          </button>
        </div>
      </div>
      
      {/* My Treatment Tab */}
      {activeTab === 'treatment' && (
        <main className="pb-20">
          {/* Welcome Banner */}
          <section className="px-4 pt-4 pb-1">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Good morning, {mockData.patient.firstName}</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Your treatment plan is on track.</p>
          </section>
          
          {/* Current Medication Card */}
          <section className="px-4 mb-6">
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 transition-transform active:scale-[0.98]">
              <div className="p-4 bg-blue-500 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{mockData.medication.name}</h3>
                  <span className="bg-white text-blue-800 px-2 py-0.5 text-xs font-medium rounded-full">
                    {mockData.medication.status}
                  </span>
                </div>
                <p className="text-sm opacity-90">{mockData.medication.description}</p>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-gray-500">Next Dose</span>
                    <p className="font-medium">{mockData.medication.nextDose}</p>
                  </div>
                  <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium min-h-[44px] min-w-[44px]">
                    Set Reminder
                  </button>
                </div>
                
                {/* Next Shipment Info */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500">Next Shipment</span>
                    <p className="font-medium">{mockData.medication.nextShipment}</p>
                    <p className="text-xs text-gray-500">{mockData.medication.shipmentNote}</p>
                  </div>
                  <button 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium min-h-[44px] min-w-[44px]"
                    onClick={() => showModal('shipment-details')}
                  >
                    Details
                  </button>
                </div>
                
                {/* Treatment Timeline */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Treatment Progress</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                      Week {mockData.medication.progress.current} of {mockData.medication.progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${mockData.medication.progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    className="flex-1 py-2 bg-blue-600 text-white rounded-md text-sm font-medium flex items-center justify-center min-h-[44px]"
                    onClick={() => showModal('medication-guide')}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Guide
                  </button>
                  <button 
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium flex items-center justify-center min-h-[44px]"
                    onClick={() => showModal('report-issue')}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Provider Recommendation (Cross-sell) */}
          <section className="px-4 mb-6">
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="p-3 bg-blue-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full mr-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-blue-800">Provider Recommended</h3>
                </div>
              </div>
              <div className="p-4 flex items-center">
                <img 
                  src={mockData.recommendation.imageUrl} 
                  alt={mockData.recommendation.name} 
                  className="w-20 h-20 rounded-md mr-4 object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{mockData.recommendation.name}</h4>
                  <p className="text-xs text-gray-600 mb-1">{mockData.recommendation.description}</p>
                  <div className="flex items-baseline mb-2">
                    <span className="font-medium text-sm">${mockData.recommendation.price}/month</span>
                    <span className="ml-2 text-xs line-through text-gray-500">
                      ${mockData.recommendation.regularPrice}/month
                    </span>
                  </div>
                  <button 
                    className="text-blue-600 text-xs font-medium flex items-center"
                    onClick={() => {
                      // Show a confirmation toast
                      toast.success(`${mockData.recommendation.name} added to your subscription!`);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Subscription
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Treatment Phase Card */}
          <section className="px-4 mb-6">
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 transition-transform active:scale-[0.98]">
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Current Phase: {mockData.treatmentPhase.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{mockData.treatmentPhase.description}</p>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">What to expect</h4>
                      <ul className="mt-1 text-xs text-blue-700 list-disc pl-4 space-y-1">
                        <li>Your provider will monitor your response to the medication</li>
                        <li>You may experience some side effects as your body adjusts</li>
                        <li>Record any side effects to discuss with your provider</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">Next Check-in</span>
                    <p className="font-medium">{mockData.treatmentPhase.nextCheckIn}</p>
                  </div>
                  <button 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium min-h-[44px] min-w-[44px]"
                    onClick={() => {
                      // Show a modal for scheduling
                      showModal('schedule-checkin');
                      // Could also navigate to a calendar page
                      // navigate('/appointments/schedule');
                    }}
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Health Metrics */}
          <section className="px-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Your Health Metrics</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 p-3 transition-transform active:scale-[0.98]">
                <span className="text-xs text-gray-500">Weight</span>
                <div className="flex items-baseline mt-1">
                  <span className="text-xl font-bold">{mockData.healthMetrics.weight.current}</span>
                  <span className="text-sm text-gray-500 ml-1">{mockData.healthMetrics.weight.unit}</span>
                  <span className="ml-auto text-xs text-green-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    {mockData.healthMetrics.weight.change} {mockData.healthMetrics.weight.unit}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${mockData.healthMetrics.weight.progress}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 text-right">
                  Target: {mockData.healthMetrics.weight.target} {mockData.healthMetrics.weight.unit}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 p-3 transition-transform active:scale-[0.98]">
                <span className="text-xs text-gray-500">BMI</span>
                <div className="flex items-baseline mt-1">
                  <span className="text-xl font-bold">{mockData.healthMetrics.bmi.current}</span>
                  <span className="ml-auto text-xs text-green-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                    {mockData.healthMetrics.bmi.change}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${mockData.healthMetrics.bmi.progress}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 text-right">
                  Target: {mockData.healthMetrics.bmi.target}
                </div>
              </div>
            </div>
          </section>
          
          {/* Essential Resources */}
          <section className="px-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Essential Resources</h3>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="divide-y divide-gray-100">
                {mockData.resources.map((resource) => (
                  <button 
                    key={resource.id}
                    className="w-full flex items-center p-4 active:bg-gray-50 text-left min-h-[44px]"
                    onClick={() => showModal(resource.id)}
                  >
                    {/* Use explicit classes instead of dynamic template literals for Tailwind */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      resource.color === 'blue' 
                        ? 'bg-blue-100 text-blue-600' 
                        : resource.color === 'orange' 
                          ? 'bg-orange-100 text-orange-600' 
                          : resource.color === 'green' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                    }`}>
                      {resource.icon === 'document' && <FileText className="h-5 w-5" />}
                      {resource.icon === 'warning' && <Info className="h-5 w-5" />}
                      {resource.icon === 'shopping' && <ShoppingBag className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-xs text-gray-500">{resource.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </section>
          
          {/* Educational Resources */}
          <PatientHomeResourcesSection />
          
          {/* Provider Notes */}
          <section className="px-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Provider Notes</h3>
              <button 
                className="text-blue-600 text-sm font-medium"
                onClick={() => {
                  // Navigate to provider notes page or show a modal
                  navigate('/patients/provider-notes');
                  // Could also show a modal with all notes
                  // showModal('all-provider-notes');
                }}
              >
                View All
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 p-4">
              <div className="flex items-start mb-3">
                <img 
                  src={mockData.providerNotes.provider.imageUrl} 
                  alt="Provider" 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-medium">{mockData.providerNotes.provider.name}</h4>
                  <p className="text-xs text-gray-500">{mockData.providerNotes.provider.date}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{mockData.providerNotes.note}</p>
              <div className="mt-3 flex justify-end">
                <button 
                  className="text-blue-600 text-sm font-medium min-h-[44px] min-w-[44px]"
                  onClick={() => {
                    // Navigate to messaging page or show a modal
                    showModal('message-provider');
                    // Could also navigate to a messaging page
                    // navigate('/messaging/new?provider=' + encodeURIComponent(mockData.providerNotes.provider.name));
                  }}
                >
                  Message Provider
                </button>
              </div>
            </div>
          </section>
          
          {/* Complete Your Treatment - Horizontal Scrolling Product Cards */}
          <section className="px-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Complete Your Treatment</h3>
            
            <div className="overflow-x-auto -mx-4 px-4">
              <div className="flex space-x-4 pb-2">
                {mockData.recommendedProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="w-36 flex-shrink-0 bg-white rounded-lg shadow border border-gray-200 overflow-hidden transition-transform active:scale-[0.98]"
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      {product.isPopular && (
                        <div className="flex items-center mb-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">
                            Popular
                          </span>
                        </div>
                      )}
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                      <span className="text-xs font-medium">${product.price}/month</span>
                      <button 
                        className="mt-2 w-full py-1 bg-blue-600 text-white rounded text-xs font-medium"
                        onClick={() => {
                          // Show a confirmation toast
                          toast.success(`${product.name} added to your subscription!`);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
      
      {/* My Subscription Tab */}
      {activeTab === 'subscription' && (
        <main className="pb-20">
          {/* Subscription Status Card */}
          <section className="px-4 pt-4 mb-6">
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 transition-transform active:scale-[0.98]">
              <div className="p-4 bg-green-500 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{mockData.subscription.name}</h3>
                  <span className="bg-white text-green-800 px-2 py-0.5 text-xs font-medium rounded-full">
                    {mockData.subscription.status}
                  </span>
                </div>
                <p className="text-sm opacity-90">
                  Monthly subscription • Started {mockData.subscription.startDate}
                </p>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500">Next Payment</span>
                    <p className="font-medium">{mockData.subscription.nextPayment}</p>
                  </div>
                  <span className="font-medium">${mockData.subscription.price}/month</span>
                </div>
                
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500">Next Shipment</span>
                    <p className="font-medium">{mockData.subscription.nextShipment}</p>
                  </div>
                  <button 
                    className="text-blue-600 font-medium text-sm min-h-[44px] min-w-[44px]"
                    onClick={() => {
                      // Show a modal with tracking information
                      showModal('shipment-details');
                    }}
                  >
                    Track
                  </button>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium flex items-center justify-center min-h-[44px]"
                    onClick={() => {
                      // Show a confirmation modal
                      if (window.confirm('Are you sure you want to pause your subscription? You can resume it later.')) {
                        toast.success('Your subscription has been paused. It will resume on June 2, 2025.');
                      }
                    }}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Pause
                  </button>
                  <button 
                    className="flex-1 py-2 bg-blue-600 text-white rounded-md text-sm font-medium flex items-center justify-center min-h-[44px]"
                    onClick={() => {
                      // Navigate to billing page or show a modal
                      navigate('/patients/billing');
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Manage Billing
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Enhance Your Subscription (Cross-sell) */}
          <section className="px-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Enhance Your Subscription</h3>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <TrendingDown className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Weight Management Bundle</h4>
                    <p className="text-xs text-gray-600">Save 15% when you add these products</p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {mockData.subscription.bundleSuggestions.map((item) => (
                  <div key={item.id} className="p-3 flex items-center">
                    <input 
                      type="checkbox" 
                      id={`bundle-item-${item.id}`}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-3"
                    />
                    <div className="flex-1">
                      <label htmlFor={`bundle-item-${item.id}`} className="text-sm font-medium">
                        {item.name}
                      </label>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <span className="text-sm font-medium">+${item.price}/mo</span>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button 
                  className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                  onClick={() => {
                    // Get selected items
                    const checkboxes = document.querySelectorAll('input[id^="bundle-item-"]:checked');
                    const selectedItems = Array.from(checkboxes).map(checkbox => {
                      const id = checkbox.id.replace('bundle-item-', '');
                      return mockData.subscription.bundleSuggestions.find(item => item.id === id);
                    });
                    
                    if (selectedItems.length === 0) {
                      toast.info("Please select at least one item");
                      return;
                    }
                    
                    // Calculate total price
                    const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
                    
                    // Show success message
                    toast.success(`${selectedItems.length} items added to your subscription! +$${totalPrice}/month`);
                    
                    // Uncheck all checkboxes
                    checkboxes.forEach(checkbox => {
                      checkbox.checked = false;
                    });
                  }}
                >
                  Add Selected Items
                </button>
              </div>
            </div>
          </section>
          
          {/* Plan Details */}
          <section className="px-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Plan Details</h3>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="divide-y divide-gray-100">
                <div className="p-4">
                  <h4 className="font-medium mb-2">Your Plan Includes</h4>
                  <ul className="space-y-2">
                    {mockData.subscription.includes.map((item, index) => (
                      <li key={`include-${index}`} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4">
                  <h4 className="font-medium mb-2">Subscription Details</h4>
                  <div className="space-y-2">
                    {Object.entries(mockData.subscription.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Order History */}
          <section className="px-4 mb-6">
            <h3 className="text-lg font-bold mb-3">Order History</h3>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="divide-y divide-gray-100">
                {mockData.subscription.orders.map((order) => (
                  <div key={order.id} className="p-4 flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium">Order #{order.id}</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                          order.status === 'Delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{order.date}</div>
                      <div className="text-xs text-gray-700 mt-1">{order.description}</div>
                    </div>
                    <button 
                      className="text-blue-600 font-medium text-sm min-h-[44px] min-w-[44px]"
                      onClick={() => {
                        // Show a modal with order details
                        showModal(`order-details-${order.id}`);
                      }}
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Payment Methods */}
          <section className="px-4 mb-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Payment Methods</h3>
              <button 
                className="text-blue-600 text-sm font-medium"
                onClick={() => {
                  // Show a modal for adding a payment method
                  showModal('add-payment-method');
                }}
              >
                + Add
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="p-4 flex items-center">
                <div className="w-10 h-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">
                      {mockData.subscription.paymentMethod.type} ending in {mockData.subscription.paymentMethod.last4}
                    </span>
                    {mockData.subscription.paymentMethod.isDefault && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Expires {mockData.subscription.paymentMethod.expiry}</div>
                </div>
                <button className="text-gray-500 p-2 min-h-[44px] min-w-[44px]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </main>
      )}
      
      {/* Bottom navigation removed - now using the one from MainLayout */}
      
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

export default PatientHomePage;
