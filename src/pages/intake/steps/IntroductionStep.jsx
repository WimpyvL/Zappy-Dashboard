import React from 'react';
import { ClipboardCheck, Shield, Clock } from 'lucide-react';

const IntroductionStep = ({ productCategory, onNext }) => {
  // Get category-specific content
  const getCategoryContent = () => {
    switch (productCategory) {
      case 'weight_management':
        return {
          title: 'Weight Management Consultation',
          description: 'Complete this form to request a weight management consultation with a healthcare provider. We\'ll review your information and determine if our weight management medications are right for you.',
          benefits: [
            'Personalized weight management plan',
            'FDA-approved medications',
            'Ongoing support from healthcare providers',
            'Convenient home delivery'
          ],
          image: 'https://placehold.co/600x400/e6f7ff/0099cc?text=Weight+Management'
        };
      case 'ed':
        return {
          title: 'Erectile Dysfunction Consultation',
          description: 'Complete this form to request an erectile dysfunction consultation with a healthcare provider. We\'ll review your information and determine if our ED medications are right for you.',
          benefits: [
            'Discreet and confidential treatment',
            'FDA-approved medications',
            'Convenient home delivery',
            'Ongoing support from healthcare providers'
          ],
          image: 'https://placehold.co/600x400/e6f7ff/0099cc?text=ED+Treatment'
        };
      case 'hair_loss':
        return {
          title: 'Hair Loss Consultation',
          description: 'Complete this form to request a hair loss consultation with a healthcare provider. We\'ll review your information and determine if our hair loss treatments are right for you.',
          benefits: [
            'Personalized hair loss treatment plan',
            'FDA-approved medications',
            'Convenient home delivery',
            'Ongoing support from healthcare providers'
          ],
          image: 'https://placehold.co/600x400/e6f7ff/0099cc?text=Hair+Loss+Treatment'
        };
      default:
        return {
          title: 'Medical Consultation',
          description: 'Complete this form to request a consultation with a healthcare provider. We\'ll review your information and determine if our treatments are right for you.',
          benefits: [
            'Personalized treatment plan',
            'FDA-approved medications',
            'Convenient home delivery',
            'Ongoing support from healthcare providers'
          ],
          image: 'https://placehold.co/600x400/e6f7ff/0099cc?text=Medical+Consultation'
        };
    }
  };
  
  const content = getCategoryContent();
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{content.title}</h2>
      <p className="text-gray-600 mb-6">{content.description}</p>
      
      <div className="mb-6">
        <img 
          src={content.image} 
          alt={content.title} 
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      </div>
      
      <div className="mb-8">
        <h3 className="font-medium text-lg mb-3">Benefits</h3>
        <ul className="space-y-2">
          {content.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <h3 className="font-medium text-lg mb-3 text-blue-800">How It Works</h3>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                <ClipboardCheck className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h4 className="font-medium">Complete this form</h4>
              <p className="text-sm text-gray-600">
                Provide your medical history and preferences to help us understand your needs.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                <Shield className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h4 className="font-medium">Healthcare provider review</h4>
              <p className="text-sm text-gray-600">
                A licensed healthcare provider will review your information and determine if treatment is appropriate.
              </p>
            </div>
          </div>
          
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h4 className="font-medium">Receive your treatment</h4>
              <p className="text-sm text-gray-600">
                If approved, your medication will be shipped directly to your door in discreet packaging.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-8">
        <p>
          By proceeding, you agree to our Terms of Service and Privacy Policy. 
          This consultation is not a replacement for emergency medical care. 
          If you are experiencing a medical emergency, please call 911 or go to your nearest emergency room.
        </p>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default IntroductionStep;
