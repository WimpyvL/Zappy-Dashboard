import React from 'react';

/**
 * A decorative component that renders childish drawing elements
 * to add a friendly, approachable feel to the UI
 * 
 * @param {Object} props
 * @param {string} props.type - The type of drawing element ('scribble', 'doodle', 'star', 'circle')
 * @param {string} props.color - The color theme to use ('accent1', 'accent2', 'accent3', 'accent4', 'primary')
 * @param {string} props.position - CSS position ('top-left', 'top-right', 'bottom-left', 'bottom-right')
 * @param {number} props.size - Size in pixels
 * @param {number} props.rotation - Rotation in degrees
 * @param {number} props.opacity - Opacity value (0-1)
 */
const ChildishDrawingElement = ({ 
  type = 'scribble', 
  color = 'accent1',
  position = 'top-right',
  size = 100,
  rotation = 0,
  opacity = 0.2
}) => {
  // Map color names to actual color values
  const colorMap = {
    primary: '#4F46E5', // Indigo
    accent1: '#F85C5C', // Red
    accent2: '#22C55E', // Green
    accent3: '#F59E0B', // Amber
    accent4: '#8B5CF6'  // Purple
  };
  
  // Get the actual color value
  const colorValue = colorMap[color] || colorMap.primary;
  
  // Map position to CSS classes
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  };
  
  const positionClass = positionClasses[position] || positionClasses['top-right'];
  
  // Generate SVG paths based on type
  const getPath = () => {
    switch(type) {
      case 'scribble':
        return (
          <path 
            d="M10,50 C20,30 40,10 80,20 C120,30 100,60 120,90 C140,120 80,100 50,70 C20,40 30,20 10,50 Z" 
            fill="none" 
            stroke={colorValue} 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        );
      case 'doodle':
        return (
          <g>
            <path 
              d="M30,20 C50,10 70,30 90,20 C110,10 90,50 70,60 C50,70 30,50 30,20 Z" 
              fill="none" 
              stroke={colorValue} 
              strokeWidth="3" 
              strokeLinecap="round"
            />
            <circle cx="60" cy="40" r="5" fill={colorValue} />
            <circle cx="80" cy="30" r="3" fill={colorValue} />
          </g>
        );
      case 'star':
        return (
          <path 
            d="M50,10 L60,40 L90,40 L65,60 L75,90 L50,70 L25,90 L35,60 L10,40 L40,40 Z" 
            fill="none" 
            stroke={colorValue} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        );
      case 'circle':
        return (
          <g>
            <circle cx="50" cy="50" r="40" fill="none" stroke={colorValue} strokeWidth="3" strokeDasharray="5,5" />
            <circle cx="50" cy="50" r="20" fill="none" stroke={colorValue} strokeWidth="2" />
          </g>
        );
      default:
        return (
          <path 
            d="M10,50 C20,30 40,10 80,20 C120,30 100,60 120,90 C140,120 80,100 50,70 C20,40 30,20 10,50 Z" 
            fill="none" 
            stroke={colorValue} 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        );
    }
  };
  
  return (
    <div 
      className={`absolute ${positionClass} pointer-events-none z-0`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
        opacity: opacity
      }}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {getPath()}
      </svg>
    </div>
  );
};

export default ChildishDrawingElement;
