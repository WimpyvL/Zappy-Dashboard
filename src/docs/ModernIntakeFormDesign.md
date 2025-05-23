# Modern Intake Form Design

## Overview

The Modern Intake Form is a redesigned version of our standard intake form, inspired by Hims/Hers and other modern telehealth platforms. It features a streamlined, focused user experience with one question per screen, clean design, visual progress indicators, and smooth transitions.

## Key Features

1. **One Question Per Screen**: Each health question is presented on its own screen, allowing users to focus on one question at a time without feeling overwhelmed.

2. **Visual Progress Indicator**: A progress bar at the top of the form shows users how far they've progressed through the questionnaire.

3. **Auto-Advancing**: For yes/no and multiple-choice questions, the form automatically advances to the next question after selection, creating a smooth flow.

4. **Animated Transitions**: Smooth animations between questions create a polished, modern feel.

5. **Category-Specific Questions**: The form adapts based on the product category (e.g., ED, weight management, hair loss), showing only relevant questions.

6. **Mobile-First Design**: The interface is fully responsive and optimized for mobile devices.

## Technical Implementation

### Component Structure

- `ModernIntakeFormPage.jsx`: Main container component that manages form state and navigation
- `ModernIntroductionStep.jsx`: Welcome screen with category-specific content
- `ModernHealthHistoryStep.jsx`: Health history questions with one-question-per-screen approach
- Additional step components to be implemented (BasicInfo, IDVerification, etc.)

### State Management

The form uses React's useState hook to manage:
- Current step/screen
- Form data for all sections
- Validation errors
- Product category

### Animation

Animations are implemented using Framer Motion, providing smooth transitions between questions and screens.

```jsx
// Example animation variants
const pageVariants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
};
```

### Routing

The modern intake form is accessible at `/intake/modern`, while the original form remains at `/intake`.

## Comparison with Original Intake Form

| Feature | Original Intake Form | Modern Intake Form |
|---------|---------------------|-------------------|
| Layout | Multiple questions per page | One question per screen |
| Navigation | Next/Previous buttons between sections | Auto-advancing for most questions |
| Visual Design | Standard form elements | Enhanced visual elements with icons |
| Animations | Minimal | Smooth transitions between questions |
| Mobile Experience | Responsive but dense | Optimized for mobile with focused UI |
| Progress Indication | Section tabs | Linear progress bar |

## Future Enhancements

1. **Save and Resume**: Allow users to save their progress and resume later
2. **Branching Logic**: Implement more sophisticated conditional questions based on previous answers
3. **Accessibility Improvements**: Enhance keyboard navigation and screen reader support
4. **Analytics Integration**: Track completion rates and identify drop-off points
5. **Pre-filling**: Pre-fill information for returning users

## Usage

To use the Modern Intake Form, navigate to `/intake/modern` or click on the "Modern Intake" link in the sidebar under Patient Care.

The form can be initialized with optional state:
- `productCategory`: Determines which category-specific questions to show
- `step`: Allows starting at a specific step
- `prescriptionItems`: Pre-selected items for the form

Example:
```jsx
navigate('/intake/modern', { 
  state: { 
    productCategory: 'ed',
    prescriptionItems: [selectedProduct]
  } 
});
