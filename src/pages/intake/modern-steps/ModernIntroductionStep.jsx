import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react';

const ModernIntroductionStep = ({ productCategory, onNext }) => {
  // Get category-specific content
  const getCategoryContent = () => {
    switch (productCategory) {
      case 'weight_management':
        return {
          title: 'Weight Management Consultation',
          description: 'Complete this form to get personalized weight management recommendations from a licensed healthcare provider.',
          benefits: [
            'Personalized weight loss plan',
            'FDA-approved medication options',
            'Ongoing provider support',
            'Convenient home delivery'
          ],
          image: '/images/weight-management.jpg'
        };
      case 'ed':
        return {
          title: 'ED Treatment Consultation',
          description: 'Complete this form to get personalized ED treatment recommendations from a licensed healthcare provider.',
          benefits: [
            'Personalized treatment plan',
            'FDA-approved medication options',
            'Discreet packaging',
            'Convenient home delivery'
          ],
          image: '/images/ed-treatment.jpg'
        };
      case 'hair_loss':
        return {
          title: 'Hair Loss Treatment Consultation',
          description: 'Complete this form to get personalized hair loss treatment recommendations from a licensed healthcare provider.',
          benefits: [
            'Personalized treatment plan',
            'FDA-approved medication options',
            'Ongoing provider support',
            'Convenient home delivery'
          ],
          image: '/images/hair-loss.jpg'
        };
      default:
        return {
          title: 'Online Medical Consultation',
          description: 'Complete this form to connect with a licensed healthcare provider for personalized treatment recommendations.',
          benefits: [
            'Personalized treatment plan',
            'FDA-approved medication options',
            'Ongoing provider support',
            'Convenient home delivery'
          ],
          image: '/images/consultation.jpg'
        };
    }
  };

  const content = getCategoryContent();
  
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <div>
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="text-center"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
        
        {/* Description */}
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          {content.description}
        </p>
        
        {/* Image (optional) */}
        <div className="mb-8 rounded-lg overflow-hidden max-w-md mx-auto">
          <img 
            src={content.image} 
            alt={content.title}
            className="w-full h-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
        
        {/* Benefits */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">What to expect</h2>
          <div className="space-y-3 max-w-md mx-auto text-left">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Process steps */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-1">5-10 minutes</h3>
            <p className="text-sm text-gray-500">to complete</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-1">Secure & private</h3>
            <p className="text-sm text-gray-500">HIPAA compliant</p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-1">Provider review</h3>
            <p className="text-sm text-gray-500">within 24 hours</p>
          </div>
        </div>
        
        {/* Start button */}
        <button
          onClick={onNext}
          className="flex items-center justify-center w-full md:w-auto mx-auto px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </motion.div>
    </div>
  );
};

export default ModernIntroductionStep;
