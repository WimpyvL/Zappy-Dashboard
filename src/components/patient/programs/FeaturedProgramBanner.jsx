import React from 'react';
import { ArrowRight } from 'lucide-react';

const FeaturedProgramBanner = ({ handleStartProgram }) => {
  return (
    <section className="mb-8 px-4">
      <div className="bg-teal-500 text-white p-6 rounded-lg big-shadow flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2">Featured Program</h2>
          <p className="text-sm mb-4">Unlock your full potential with our premium programs.</p>
          <button
            className="bg-white text-teal-600 font-semibold py-2 px-4 rounded-full flex items-center hover:bg-gray-100 transition duration-300"
            onClick={handleStartProgram}
          >
            Start Program
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
        {/* Placeholder for an image or illustration */}
        <div className="w-24 h-24 bg-teal-400 rounded-full flex-shrink-0"></div>
      </div>
    </section>
  );
};

export default FeaturedProgramBanner;
