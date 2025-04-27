import React from 'react';
import { render, screen } from '@testing-library/react';
import ChildishDrawingElement from './ChildishDrawingElement';

describe('ChildishDrawingElement Component', () => {
  test('renders with default props', () => {
    render(<ChildishDrawingElement />);
    
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    
    const pathElement = document.querySelector('path');
    expect(pathElement).toBeInTheDocument();
    
    // Check default position class
    const container = svgElement.parentElement;
    expect(container).toHaveClass('top-0 right-0'); // default is top-right
    
    // Check default color class
    expect(container).toHaveClass('text-primary');
    
    // Check default size
    expect(container.style.width).toBe('100px');
    expect(container.style.height).toBe('100px');
  });

  test('renders with custom type and color', () => {
    render(<ChildishDrawingElement type="scribble" color="accent2" />);
    
    const pathElement = document.querySelector('path');
    expect(pathElement).toBeInTheDocument();
    
    // The path should match the scribble path for accent2
    expect(pathElement).toHaveAttribute(
      'd', 
      'M10,20 Q30,40 50,20 Q70,0 90,20 Q110,40 130,20'
    );
    
    // Check color class
    const container = document.querySelector('svg').parentElement;
    expect(container).toHaveClass('text-accent2');
  });

  test('renders with custom position', () => {
    render(<ChildishDrawingElement position="bottom-left" />);
    
    const container = document.querySelector('svg').parentElement;
    expect(container).toHaveClass('bottom-0 left-0');
  });

  test('renders with custom size and rotation', () => {
    render(<ChildishDrawingElement size={200} rotation={45} />);
    
    const container = document.querySelector('svg').parentElement;
    expect(container.style.width).toBe('200px');
    expect(container.style.height).toBe('200px');
    expect(container.style.transform).toBe('rotate(45deg)');
  });

  test('applies additional className', () => {
    render(<ChildishDrawingElement className="custom-class" />);
    
    const container = document.querySelector('svg').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  test('renders watercolor type correctly', () => {
    render(<ChildishDrawingElement type="watercolor" color="accent3" />);
    
    const pathElement = document.querySelector('path');
    expect(pathElement).toHaveAttribute(
      'd', 
      'M30,30 Q50,20 60,40 Q70,60 90,50 Q110,40 100,20 Q90,0 70,10 Q50,20 30,30 Z'
    );
  });

  test('renders crayon type correctly', () => {
    render(<ChildishDrawingElement type="crayon" color="accent4" />);
    
    const pathElement = document.querySelector('path');
    expect(pathElement).toHaveAttribute(
      'd', 
      'M30,20 L50,10 L80,40 L60,50 Z'
    );
  });

  test('renders center position correctly', () => {
    render(<ChildishDrawingElement position="center" />);
    
    const container = document.querySelector('svg').parentElement;
    expect(container).toHaveClass('top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2');
  });
});