import React, { memo, useCallback } from 'react';
import { LucideScissors, LucideScale, LucidePill, LucideShield, LucideMessageSquare, LucideShoppingCart, LucideCamera, LucideClipboardCheck, LucideUtensils, LucideHeartPulse } from 'lucide-react';
import ServiceResourcesSection from './ServiceResourcesSection';
import './ModularServiceInterface.css';

// Map service type to icon and color scheme - moved outside component for better performance
const SERVICE_CONFIG = {
  'hair-loss': {
    icon: LucideScissors,
    colors: {
      primary: '#4F46E5',
      secondary: '#818CF8',
      light: '#F5F7FF',
      lighter: '#EEF2FF',
      border: '#E0E7FF'
    }
  },
  'weight-management': {
    icon: LucideScale,
    colors: {
      primary: '#F85C5C',
      secondary: '#FF8080',
      light: '#FFF5F5',
      lighter: '#FEF2F2',
      border: '#FECACA'
    }
  },
  'ed-treatment': {
    icon: LucidePill,
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      light: '#F0FDF9',
      lighter: '#ECFDF5',
      border: '#A7F3D0'
    }
  }
};

// Action icon mapping - moved outside component
const ACTION_ICONS = {
  'camera': LucideCamera,
  'assessment': LucideClipboardCheck,
  'weight': LucideScale,
  'food': LucideUtensils,
  'health': LucideHeartPulse
};

/**
 * ModularServiceInterface - A component for displaying patient services in a modular interface
 *
 * This component implements the modular patient interface design as shown in the HTML mockup.
 * It displays patient services in a modular format with provider recommendations directly
 * below each service module.
 */
const ModularServiceInterface = ({
  services = [],
  onViewPlanDetails = () => {},
  onMessageProvider = () => {},
  onOrderRefills = () => {},
  onLogWeight = () => {},
  onTakePhotos = () => {},
  onAddProduct = () => {},
  onViewMedicationInstructions = () => {}
}) => {

  // Helper function to get service configuration - with null check for serviceType
  const getServiceConfig = useCallback((serviceType) => {
    return SERVICE_CONFIG[serviceType || 'hair-loss'] || SERVICE_CONFIG['hair-loss'];
  }, []);

  return (
    <div className="space-y-8">
      {services.map((service, index) => {
        const config = getServiceConfig(service.type);
        const ServiceIcon = config.icon;
        
        return (
          <React.Fragment key={service.id || index}>
            {/* Service Module */}
// Define common Tailwind classes as constants
const BASE_MODULE_CLASSES = "service-module bg-white rounded-xl shadow-md overflow-hidden border-l-4";
const MODULE_HEADER_CLASSES = "px-5 py-4 border-b border-gray-100";
const MODULE_CONTENT_CLASSES = "p-5";
const MEDICATION_ITEM_CLASSES = "flex items-start";
const MEDICATION_IMAGE_CONTAINER_CLASSES = "flex-shrink-0 h-16 w-16 rounded-lg flex items-center justify-center overflow-hidden";
const MEDICATION_DETAILS_CLASSES = "ml-4";
const ACTION_ITEMS_SECTION_CLASSES = "mt-6";
const ACTION_ITEM_CLASSES = "action-item flex items-center justify-between p-3 rounded-lg border";
const ACTION_ITEM_ICON_CONTAINER_CLASSES = "w-8 h-8 rounded-full flex items-center justify-center mr-3";
const MODULE_ACTIONS_CLASSES = "mt-6 flex flex-wrap gap-3";
const PRIMARY_BUTTON_CLASSES = "px-4 py-2 text-white rounded-full text-sm font-medium hover:bg-opacity-90 flex items-center";
const SECONDARY_BUTTON_CLASSES = "px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 flex items-center";
const RECOMMENDATIONS_SECTION_CLASSES = "mt-3 bg-white rounded-xl shadow-sm overflow-hidden border";
const RECOMMENDATIONS_HEADER_CLASSES = "p-3 border-b flex items-center";
const RECOMMENDATIONS_ICON_CONTAINER_CLASSES = "p-1.5 rounded-full mr-2";
const PRODUCT_CARD_CLASSES = "w-40 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden snap-start";
const PRODUCT_IMAGE_CONTAINER_CLASSES = "h-32 bg-gray-100 flex items-center justify-center";
const PRODUCT_DETAILS_CLASSES = "p-3";
const PRODUCT_ADD_BUTTON_CLASSES = "text-xs text-white px-2 py-1 rounded-full";


/**
 * ModularServiceInterface - A component for displaying patient services in a modular interface
 *
 * This component implements the modular patient interface design as shown in the HTML mockup.
 * It displays patient services in a modular format with provider recommendations directly
 * below each service module.
 */
const ModularServiceInterface = ({
  services = [],
  onViewPlanDetails = () => {},
  onMessageProvider = () => {},
  onOrderRefills = () => {},
  onLogWeight = () => {},
  onTakePhotos = () => {},
  onAddProduct = () => {},
  onViewMedicationInstructions = () => {}
}) => {

  // Helper function to get service configuration - with null check for serviceType
  const getServiceConfig = useCallback((serviceType) => {
    return SERVICE_CONFIG[serviceType || 'hair-loss'] || SERVICE_CONFIG['hair-loss'];
  }, []);

  return (
    <div className="space-y-8">
      {services.map((service, index) => {
        const config = getServiceConfig(service.type);
        const ServiceIcon = config.icon;
        
        return (
          <React.Fragment key={service.id || index}>
            {/* Service Module */}
            <div className={`${BASE_MODULE_CLASSES}`} 
                 style={{ borderLeftColor: config.colors.primary }}>
              {/* Module Header */}
              <div className={`${MODULE_HEADER_CLASSES}`} style={{ backgroundColor: config.colors.light }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center" style={{ color: config.colors.primary }}>
                    <ServiceIcon className="h-5 w-5 mr-2" style={{ color: config.colors.primary }} />
                    {service.name}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button 
                      className="text-xs font-medium hover:underline flex items-center"
                      style={{ color: config.colors.primary }}
                      onClick={() => onViewPlanDetails(service)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Plan Details
                    </button>
                    <div className="inline-block px-2 py-1 text-white text-xs font-medium rounded" 
                         style={{ backgroundColor: config.colors.secondary }}>
                      {service.status}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Module Content */}
              <div className={`${MODULE_CONTENT_CLASSES}`}>
                {/* Medications */}
                {service.medications && service.medications.length > 0 && (
                  <div className="space-y-4">
                    {service.medications.map((medication, medIndex) => (
                      <div key={medIndex} className={`${MEDICATION_ITEM_CLASSES}`}>
                        <div className={`${MEDICATION_IMAGE_CONTAINER_CLASSES}`} 
                             style={{ backgroundColor: config.colors.lighter }}>
                          {medication.imageUrl && (
                            <img 
                              src={medication.imageUrl} 
                              alt={medication.name} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className={`${MEDICATION_DETAILS_CLASSES}`}>
                          <h4 className="text-base font-medium">{medication.name}</h4>
                          <p className="text-sm text-gray-500">{medication.instructions}</p>
                          <div className="mt-2 flex">
                            <button 
                              className="text-sm font-medium hover:underline" 
                              style={{ color: config.colors.primary }}
                              onClick={() => onViewMedicationInstructions(medication)}
                            >
                              View Instructions
                            </button>
                            <span className="mx-2 text-gray-300">|</span>
                            <button 
                              className="text-sm font-medium hover:underline" 
                              style={{ color: config.colors.primary }}
                              onClick={() => {
                                // Check eligibility before showing refill UI
                                const isEligible = medication.isEligibleForRefill !== false;
                                if (isEligible) {
                                  onOrderRefills(service);
                                } else {
                                  // Use a more appropriate notification method instead of alert
                                  const reason = medication.refillEligibilityReason || 'Too soon for refill';
                                  showToast(`Not eligible for refill: ${reason}`, 'warning');
                                }
                              }}
                            >
                              Refill
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Action Items */}
                {service.actionItems && service.actionItems.length > 0 && (
                  <div className={`${ACTION_ITEMS_SECTION_CLASSES}`}>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Action Items</h4>
                    <div className="space-y-3">
                      {service.actionItems.map((action, actionIndex) => {
                        const ActionIcon = ACTION_ICONS[action?.icon] || LucideClipboardCheck;
                        
                        return (
                          <div key={actionIndex} className={`${ACTION_ITEM_CLASSES}`} 
                               style={{ backgroundColor: config.colors.light, borderColor: config.colors.border }}>
                            <div className="flex items-center">
                              <div className={`${ACTION_ITEM_ICON_CONTAINER_CLASSES}`} 
                                   style={{ backgroundColor: config.colors.lighter }}>
                                <ActionIcon className="h-4 w-4" style={{ color: config.colors.primary }} />
                              </div>
                              <div>
                                <h5 className="text-sm font-medium">{action.title}</h5>
                                <p className="text-xs text-gray-500">{action.description}</p>
                              </div>
                            </div>
                            <button 
                              className="px-3 py-1.5 text-white text-xs font-medium rounded-full hover:bg-opacity-90" 
                              style={{ backgroundColor: config.colors.primary }}
                              onClick={() => {
                                // Handle different action types
                                if (action.icon === 'weight') {
                                  onLogWeight(action, service);
                                } else if (action.icon === 'camera') {
                                  onTakePhotos(action, service);
                                } else {
                                  // Generic handler for other action types
                                  // No action needed for now
                                }
                              }}
                            >
                              {action.buttonText}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Educational Resources Section */}
                {service.resources && (
                  <ServiceResourcesSection 
                    resources={service.resources}
                    serviceConfig={config}
                    serviceType={service.type}
                  />
                )}
                
                {/* Module Actions */}
                <div className={`${MODULE_ACTIONS_CLASSES}`}>
                  <button 
                    className={`${PRIMARY_BUTTON_CLASSES}`} 
                    style={{ backgroundColor: config.colors.primary }}
                    onClick={() => onMessageProvider(service)}
                  >
                    <LucideMessageSquare className="w-4 h-4 mr-2" /> Message Provider
                  </button>
                  <button 
                    className={`${SECONDARY_BUTTON_CLASSES}`}
                    onClick={() => onOrderRefills(service)}
                  >
                    <LucideShoppingCart className="w-4 h-4 mr-2" /> Order Refills
                  </button>
                </div>
              </div>
            </div>
            
            {/* Provider Recommendations for this service */}
            {service.recommendations && service.recommendations.length > 0 && (
              <div className={`${RECOMMENDATIONS_SECTION_CLASSES}`} 
                   style={{ borderColor: config.colors.border }}>
                <div className={`${RECOMMENDATIONS_HEADER_CLASSES}`} 
                     style={{ backgroundColor: config.colors.light, borderColor: config.colors.border }}>
                  <div className={`${RECOMMENDATIONS_ICON_CONTAINER_CLASSES}`} style={{ backgroundColor: config.colors.lighter }}>
                    <LucideShield className="h-4 w-4" style={{ color: config.colors.primary }} />
                  </div>
                  <h4 className="text-sm font-medium" style={{ color: config.colors.primary }}>Provider Recommended</h4>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto -mx-4 px-4 product-scroll">
                    <div className="flex space-x-4 pb-2 snap-x snap-mandatory">
                      {service.recommendations.map((product, productIndex) => (
                        <div key={productIndex} className={`${PRODUCT_CARD_CLASSES}`}>
                          <div className={`${PRODUCT_IMAGE_CONTAINER_CLASSES}`}>
                            {product.imageUrl && (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className={`${PRODUCT_DETAILS_CLASSES}`}>
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">${product.price}</span>
                              <button 
                                className={`${PRODUCT_ADD_BUTTON_CLASSES}`} 
                                style={{ backgroundColor: config.colors.primary }}
                                onClick={() => onAddProduct(product, service)}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


// Wrap with memo for performance optimization
export default memo(ModularServiceInterface);
