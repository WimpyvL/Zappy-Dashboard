import React from 'react';
import { Users } from 'lucide-react';

const ReferralDiscountsSection = ({ handleInviteMore }) => {
  // Hardcoded referral discount - this should ideally come from an API
  const referralDiscount = {
    text: 'Refer a friend and get $20 off your next order!',
    imageUrl: 'https://via.placeholder.com/150',
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Referral Discounts</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex items-center p-4">
        <img src={referralDiscount.imageUrl} alt="Referral Discount" className="w-20 h-20 object-cover rounded-lg mr-4"/>
        <div className="flex-1">
          <p className="text-sm text-gray-800 mb-2">{referralDiscount.text}</p>
          <button
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full hover:bg-blue-700 flex items-center"
            onClick={handleInviteMore}
          >
            Invite More <Users size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralDiscountsSection;
