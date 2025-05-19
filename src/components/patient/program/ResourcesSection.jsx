import React from 'react';
import { BookOpen, Play, Clock } from 'lucide-react';
import { toast } from 'react-toastify'; // Assuming toast is used directly in the component

const ResourcesSection = ({ resources }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-3 px-1">Resources</h3>
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex space-x-4 pb-4">
          {resources.map(resource => (
            <div key={resource.id} className="w-64 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {resource.type === 'Video' ? (
                  <div className="relative w-full h-full bg-gray-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <Play className="h-5 w-5 text-[#F85C5C] ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      <Clock className="h-3 w-3 inline mr-1" />3 min
                    </div>
                  </div>
                ) : (
                  <BookOpen className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{resource.type}</span>
                  <button
                    onClick={() => toast.info(`Viewing resource "${resource.title}"`)}
                    className="text-xs text-[#4F46E5] hover:underline"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcesSection;
