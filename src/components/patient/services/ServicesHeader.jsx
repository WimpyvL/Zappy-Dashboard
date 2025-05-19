import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ServicesHeader = ({ greeting, cartCount }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="bg-teal-500 px-4 pt-6 pb-8 rounded-b-3xl relative shadow-md">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-2xl font-bold text-white">My Health Services</h1>
          <p className="text-teal-100 text-sm">Manage all your health services in one place</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
              onClick={() => navigate('/cart')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>
      <p className="text-teal-100 text-sm">{greeting}, {user?.first_name || 'there'}</p>
    </div>
  );
};

export default ServicesHeader;
