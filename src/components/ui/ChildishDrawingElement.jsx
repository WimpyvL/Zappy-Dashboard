import React from 'react';
import DecorativeElement from './DecorativeElement';

/**
 * A compatibility wrapper for DecorativeElement
 * This component exists to maintain backward compatibility with code
 * that was using ChildishDrawingElement
 * 
 * @param {Object} props - All props are passed directly to DecorativeElement
 */
const ChildishDrawingElement = (props) => {
  // Simply pass all props to DecorativeElement
  return <DecorativeElement {...props} />;
};

export default ChildishDrawingElement;
