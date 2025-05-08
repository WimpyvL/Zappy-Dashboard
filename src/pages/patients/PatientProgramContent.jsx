import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Target, BookOpen, MessageSquare, BarChart2, Check, Play, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { usePatientTreatmentProgram } from '../../hooks/usePatientTreatmentProgram';
import { useRecommendedProducts } from '../../hooks/useRecommendedProducts';
import { toast } from 'react-toastify';

const PatientProgramContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const patientId = user?.id;
  
  // Fetch the patient's program
  const { 
    data: program, 
    isLoading: isLoadingProgram,
    error: programError
  } = usePatientTreatmentProgram(patientId);
  
  // Fetch recommended products based on the program's treatment type
  const { 
    recommendedProducts,
    isLoading: isLoadingProducts
  } = useRecommendedProducts(
    patientId, 
    program?.treatmentType || 'weight-management'
  );
  
  // Handle adding a product to cart or subscription
  const handleAddProduct = (product) => {
    // In a real implementation, this would add the product to the cart or subscription
    toast.success(`${product.name} added to your cart!`);
  };
  
  if (isLoadingProgram) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (programError) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p>Error loading program: {programError?.message || 'Unknown error'}</p>
      </div>
    );
  }
  
  if (!program) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-xl font-bold mb-4">No Active Program</h2>
        <p className="text-gray-600 mb-6">
          You don't have an active treatment program. Subscribe to a treatment package to get started.
        </p>
        <button
          onClick={() => navigate('/my-subscription')}
          className="bg-[#F85C5C] hover:bg-[#F85C5C]/90 text-white px-6 py-3 rounded-full font-semibold"
        >
          View Subscription Options
        </button>
      </div>
    );
  }
  
  // Calculate program progress percentage
  const progressPercentage = Math.round((program.currentWeek / (program.duration.split(' ')[0] * 4)) * 100);
  
  return (
    <div className="space-y-6">
      {/* Program Card - Vibrant Style */}
      <div className="relative h-48 rounded-xl overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">{program.name}</h2>
          <p className="text-sm opacity-90 mb-3">Week {program.currentWeek} of {program.duration}</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/30 rounded-full h-2 mb-1">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs">{progressPercentage}% Complete</p>
        </div>
      </div>

      {/* Program Goal Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-[#F85C5C]">
        <div className="p-5">
          <div className="inline-block px-2 py-1 bg-[#FF8080] text-white text-xs font-medium rounded mb-2">
            Goal
          </div>
          <h3 className="text-lg font-semibold mb-2">Program Goal</h3>
          <p className="text-gray-700">{program.goal}</p>
        </div>
      </div>

      {/* Weekly Tasks Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-[#4F46E5]"/>This Week's Tasks
          </h3>
        </div>
        <div className="p-5">
          {program.tasks.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {program.tasks.map(task => (
                <li key={task.id} className="py-3 flex items-center justify-between">
                  <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {task.description}
                  </span>
                  {task.completed ? (
                    <div className="bg-green-100 p-1 rounded-full">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => toast.info(`Marking task "${task.description}" as complete`)}
                      className="text-xs bg-[#4F46E5] text-white px-3 py-1 rounded-full hover:bg-[#4F46E5]/90"
                    >
                      Complete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-sm text-gray-500 text-center py-4">No tasks assigned for this week.</p>
          )}
        </div>
      </div>

      {/* Progress Tracking Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-[#F85C5C]"/>Progress Tracking
          </h3>
        </div>
        <div className="p-5">
          <div className="text-sm text-gray-700 space-y-2 mb-3">
            {program.progress.filter(p => p.metric === 'Weight').map(p => (
               <div key={`prog-${p.week}`} className="flex justify-between items-center">
                 <span>Week {p.week}</span>
                 <span className="font-medium">{p.value} {p.unit}</span>
               </div>
            ))}
          </div>
          
          {/* Simple chart visualization */}
          <div className="h-24 flex items-end space-x-2 mt-4">
            {program.progress.filter(p => p.metric === 'Weight').map((p, index, arr) => {
              // Calculate height percentage based on min/max values
              const values = arr.map(item => item.value);
              const min = Math.min(...values);
              const max = Math.max(...values);
              const range = max - min;
              const heightPercent = range === 0 ? 100 : ((p.value - min) / range) * 100;
              
              return (
                <div key={`chart-${p.week}`} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-[#F85C5C]/80 rounded-t"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <div className="text-xs mt-1">W{p.week}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-3 px-1">Resources</h3>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex space-x-4 pb-4">
            {program.resources.map(resource => (
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
      
      {/* Contact Coach Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-[#4F46E5]">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="inline-block px-2 py-1 bg-[#818CF8] text-white text-xs font-medium rounded mb-2">
                Support
              </div>
              <h3 className="text-lg font-semibold mb-1">Your Program Coach</h3>
              <p className="text-gray-700 mb-4">Your coach is <span className="font-medium">{program.coach.name}</span></p>
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
      
      {/* Cross-Selling Section */}
      {!isLoadingProducts && recommendedProducts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3 px-1">Recommended for You</h3>
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex space-x-4 pb-4">
              {recommendedProducts.map(product => (
                <div key={product.id} className="w-40 flex-shrink-0 bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Target className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {product.isPopular && (
                      <div className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded mb-1">
                        Popular
                      </div>
                    )}
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">${product.price?.toFixed(2) || '0.00'}</span>
                      <button 
                        className="text-xs bg-[#F85C5C] text-white px-2 py-1 rounded-full"
                        onClick={() => handleAddProduct(product)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProgramContent;
