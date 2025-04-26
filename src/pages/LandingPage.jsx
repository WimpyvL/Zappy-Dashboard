import React from 'react';
import { Link } from 'react-router-dom';
import { User, Shield } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-accent1/10 via-white to-accent2/10">
      {/* Centered logo or title */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
        <img src="/logo192.png" alt="Zappy Logo" className="mx-auto mb-4 w-20 h-20" />
        <h1 className="text-3xl font-bold text-primary mb-2">Welcome to Zappy</h1>
        <p className="text-lg text-gray-600">Choose your portal</p>
      </div>
      {/* Floating Buttons */}
      <div className="flex flex-col gap-8 z-10">
        <Link
          to="/auth/patient-login"
          className="flex items-center gap-3 px-8 py-4 rounded-full shadow-lg bg-primary text-white text-xl font-semibold hover:bg-primary/90 transition-all duration-200"
        >
          <User className="w-6 h-6" />
          Patient Login
        </Link>
        <Link
          to="/auth/staff-login"
          className="flex items-center gap-3 px-8 py-4 rounded-full shadow-lg bg-accent3 text-white text-xl font-semibold hover:bg-accent3/90 transition-all duration-200"
        >
          <Shield className="w-6 h-6" />
          Staff Login
        </Link>
      </div>
      {/* Decorative floating elements */}
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-accent1/20 rounded-full blur-2xl" />
      <div className="absolute top-20 right-10 w-24 h-24 bg-accent2/20 rounded-full blur-2xl" />
    </div>
  );
};

export default LandingPage;
