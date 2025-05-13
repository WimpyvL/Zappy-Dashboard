import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactCoachCard = ({ coach }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-[#4F46E5]">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-block px-2 py-1 bg-[#818CF8] text-white text-xs font-medium rounded mb-2">
              Support
            </div>
            <h3 className="text-lg font-semibold mb-1">Your Program Coach</h3>
            <p className="text-gray-700 mb-4">Your coach is <span className="font-medium">{coach.name}</span></p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => navigate('/messages')}
          className="w-full px-4 py-3 bg-black text-white rounded-full font-medium flex items-center justify-center"
        >
          <MessageSquare className="h-4 w-4 mr-2" /> Message Coach
        </button>
      </div>
    </div>
  );
};

export default ContactCoachCard;
