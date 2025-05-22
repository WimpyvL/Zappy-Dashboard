# Product Recommendation System

## Overview

The Product Recommendation System is a hybrid approach that combines rule-based and AI-driven recommendations to suggest products to patients based on their health profiles. This system is designed to provide personalized product recommendations that are relevant to each patient's specific health needs and goals.

## Components

### 1. Database Schema

The system uses a `product_recommendation_rules` table with the following structure:

```sql
CREATE TABLE product_recommendation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  condition_type VARCHAR(50) NOT NULL, -- 'bmi', 'goal', 'condition', 'age', 'combination'
  condition_value JSONB NOT NULL, -- Stores the condition logic
  priority INTEGER NOT NULL, -- Higher number = higher priority
  product_title VARCHAR(255) NOT NULL,
  product_description TEXT NOT NULL,
  reason_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Rule Types

The system supports several types of rules:

- **BMI Rules**: Recommend products based on the patient's BMI
- **Goal Rules**: Recommend products based on the patient's health goals
- **Condition Rules**: Recommend products based on the patient's medical conditions
- **Age Rules**: Recommend products based on the patient's age
- **Combination Rules**: Combine multiple conditions with AND/OR logic

### 3. Rule Evaluation

The `recommendationService.js` evaluates a patient's health profile against the rules in the database. Rules are evaluated in priority order, and the first matching rule is used to generate a recommendation.

### 4. Admin Interface

Administrators can manage recommendation rules through the AI & Recommendation Settings page. This interface allows admins to:

- View existing rules
- Create new rules
- Edit existing rules
- Delete rules
- Filter and search rules

### 5. Patient Interface

The `SmartProductRecommendation` component displays personalized product recommendations to patients on the shop page. This component:

- Fetches the patient's health profile
- Queries recommendation rules from the database
- Evaluates the rules against the health profile
- Displays the matching recommendation to the patient

## Integration

The Product Recommendation System is integrated with:

1. The patient's health profile data
2. The shop page
3. The admin settings interface

## Future Enhancements

Potential future enhancements include:

1. Machine learning integration to improve recommendation accuracy
2. A/B testing of different recommendation strategies
3. Recommendation analytics to track effectiveness
4. Personalized discount offers based on recommendations
