import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used for navigation

// Hardcoded data for now, should be fetched from an API
const nextUpPrograms = [
  {
    id: 1,
    title: 'Understanding Your Metabolism',
    description: 'Learn how your body processes food and how to optimize it for weight management.',
    videoLength: '15 min',
    imageUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    title: 'Mindful Eating Practices',
    description: 'Develop a healthier relationship with food through mindful eating techniques.',
    videoLength: '10 min',
    imageUrl: 'https://via.placeholder.com/150',
  },
];

const NextUpSection = ({ handleWatchVideo }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Next Up For You</h2>
      <div className="horizontal-scroll-container flex space-x-4 overflow-x-auto pb-4">
        {nextUpPrograms.map(program => (
          <div key={program.id} className="flex-none w-64 card-shadow rounded-lg overflow-hidden cursor-pointer card-hover" onClick={() => handleWatchVideo(program.id)}>
            <img src={program.imageUrl} alt={program.title} className="w-full h-32 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{program.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{program.description}</p>
              <p className="text-gray-500 text-xs">{program.videoLength}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NextUpSection;
