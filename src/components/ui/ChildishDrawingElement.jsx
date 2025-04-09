import React from 'react';

/**
 * ChildishDrawingElement - A component to add childish drawing elements to the UI
 * 
 * @param {Object} props
 * @param {string} props.type - The type of drawing element ('doodle', 'scribble', 'watercolor', 'crayon')
 * @param {string} props.color - The color to use (primary, accent1, accent2, accent3, accent4)
 * @param {string} props.position - Position ('top-left', 'top-right', 'bottom-left', 'bottom-right', 'center')
 * @param {number} props.size - Size of the element in pixels
 * @param {number} props.rotation - Rotation in degrees
 * @param {string} props.className - Additional CSS classes
 */
const ChildishDrawingElement = ({ 
  type = 'doodle', 
  color = 'primary', 
  position = 'top-right', 
  size = 100, 
  rotation = 0,
  className = '' 
}) => {
  // Map of drawing elements - these would be replaced with actual SVG paths in a real implementation
  const drawings = {
    doodle: {
      primary: "M10,30 Q15,20 20,30 T30,40 Q35,50 40,30 T50,20",
      accent1: "M10,20 Q20,5 30,20 T50,30 Q60,40 70,30 T90,20",
      accent2: "M10,40 Q25,10 40,40 T70,50 Q85,60 100,50",
      accent3: "M10,50 Q30,20 50,50 T90,60 Q110,70 130,60",
      accent4: "M10,30 Q40,10 70,30 T130,40 Q160,50 190,40"
    },
    scribble: {
      primary: "M10,30 Q20,10 30,30 Q40,50 50,30 Q60,10 70,30 Q80,50 90,30",
      accent1: "M10,40 Q25,20 40,40 Q55,60 70,40 Q85,20 100,40",
      accent2: "M10,20 Q30,40 50,20 Q70,0 90,20 Q110,40 130,20",
      accent3: "M10,50 Q20,30 30,50 Q40,70 50,50 Q60,30 70,50",
      accent4: "M10,35 Q25,15 40,35 Q55,55 70,35 Q85,15 100,35"
    },
    watercolor: {
      primary: "M30,20 Q45,15 50,30 Q55,45 70,40 Q85,35 80,20 Q75,5 60,10 Q45,15 30,20 Z",
      accent1: "M20,30 Q40,20 50,40 Q60,60 80,50 Q100,40 90,20 Q80,0 60,10 Q40,20 20,30 Z",
      accent2: "M40,20 Q60,10 70,30 Q80,50 100,40 Q120,30 110,10 Q100,-10 80,0 Q60,10 40,20 Z",
      accent3: "M30,30 Q50,20 60,40 Q70,60 90,50 Q110,40 100,20 Q90,0 70,10 Q50,20 30,30 Z",
      accent4: "M20,40 Q40,30 50,50 Q60,70 80,60 Q100,50 90,30 Q80,10 60,20 Q40,30 20,40 Z"
    },
    crayon: {
      primary: "M20,20 L30,10 L70,50 L60,60 Z",
      accent1: "M30,10 L50,5 L80,35 L60,40 Z",
      accent2: "M10,30 L30,20 L60,50 L40,60 Z",
      accent3: "M20,40 L40,30 L70,60 L50,70 Z",
      accent4: "M30,20 L50,10 L80,40 L60,50 Z"
    }
  };

  // Position classes
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  };

  // Color classes
  const colorClasses = {
    primary: 'text-primary',
    accent1: 'text-accent1',
    accent2: 'text-accent2',
    accent3: 'text-accent3',
    accent4: 'text-accent4'
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} ${colorClasses[color]} ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
        opacity: 0.7,
        pointerEvents: 'none'
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={drawings[type][color]} />
      </svg>
    </div>
  );
};

export default ChildishDrawingElement;
