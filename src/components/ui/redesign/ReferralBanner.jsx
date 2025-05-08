import React from 'react';
import PropTypes from 'prop-types';

/**
 * ReferralBanner component
 * 
 * A banner component for displaying referral promotions
 * 
 * @param {string} title - The main title text
 * @param {string} subtitle - The subtitle or description text
 * @param {string} buttonText - The text for the action button
 * @param {function} onButtonClick - Function to call when the button is clicked
 * @param {node} icon - Optional icon to display
 * @param {number} referralCount - Optional number of successful referrals to display
 */
const ReferralBanner = ({
  title,
  subtitle,
  buttonText,
  onButtonClick,
  icon,
  referralCount
}) => {
  return (
    <div className="bg-[#dbeafe] rounded-lg p-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        {icon && (
          <div className="mr-4">
            {icon}
          </div>
        )}
        
        <div>
          <h3 className="font-semibold text-[#2D7FF9] text-sm md:text-base">{title}</h3>
          <p className="text-gray-600 text-xs md:text-sm">
            {subtitle}
            {referralCount > 0 && (
              <span className="ml-1">
                You've already helped {referralCount} friend{referralCount !== 1 ? 's' : ''}!
              </span>
            )}
          </p>
        </div>
      </div>
      
      <button 
        className="bg-[#2D7FF9] text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap"
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
};

ReferralBanner.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  icon: PropTypes.node,
  referralCount: PropTypes.number
};

export default ReferralBanner;
