import React from 'react';

const ReferralBanner = ({ handleReferral }) => {
  // Hardcoded referral discount - this should ideally come from an API
  const referralDiscount = {
    text: 'Refer a friend and get $20 off your next order!',
    imageUrl: 'https://via.placeholder.com/150', // Although not used in this component's JSX, keeping for potential future use or context
  };

  return (
    <div className="px-4 py-3 bg-blue-100 text-blue-800 text-sm text-center font-medium">
      {referralDiscount.text} <a href="#" onClick={handleReferral} className="underline">Learn More</a>
    </div>
  );
};

export default ReferralBanner;
