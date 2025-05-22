# Subscription Durations Feature

## Overview

The Subscription Durations feature allows administrators to define different billing cycles for subscription plans. This enables flexible subscription options for patients, such as monthly, quarterly, semi-annual, or annual billing cycles. Each duration can have an associated discount percentage, encouraging patients to choose longer subscription periods.

## Key Components

### Database Schema

The subscription durations are stored in the `subscription_durations` table with the following structure:

- `id`: Unique identifier
- `name`: Display name (e.g., "Monthly", "Quarterly", "Annual")
- `duration_months`: Number of months for the billing cycle
- `duration_days`: Optional specific number of days (for more precise durations)
- `discount_percent`: Percentage discount applied to subscriptions with this billing cycle
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### API Endpoints

The subscription durations API provides the following endpoints:

- `GET /subscription-durations`: Retrieve all subscription durations
- `GET /subscription-durations/:id`: Retrieve a specific subscription duration
- `POST /subscription-durations`: Create a new subscription duration
- `PUT /subscription-durations/:id`: Update an existing subscription duration
- `DELETE /subscription-durations/:id`: Delete a subscription duration

### React Components

1. **SubscriptionDurationModal.jsx**: Modal component for creating and editing subscription durations
2. **SubscriptionDurationsPage.jsx**: Page component for managing subscription durations
3. **ProductSubscriptionManagement.jsx**: Integrated management page for products, subscriptions, and billing cycles

### Custom Hooks

- **useSubscriptionDurationForm.js**: Custom hook for managing subscription duration form state and validation

## Integration with Subscription Plans

Subscription durations are linked to subscription plans through a foreign key relationship. Each subscription plan can reference a specific duration, which determines:

1. How long the subscription period lasts
2. What discount is applied to the subscription price
3. When the subscription will renew

## User Flow

1. Administrator creates subscription durations (e.g., Monthly, Quarterly, Annual)
2. Administrator creates subscription plans and associates them with specific durations
3. When a patient selects a subscription plan, they see the available durations and associated discounts
4. Patient selects a duration and the appropriate price is calculated based on the duration's discount
5. The subscription is created with the selected duration, determining the renewal cycle

## Implementation Details

### Migration

The database migration (`20250523_add_subscription_durations.sql`) creates the subscription durations table and adds a foreign key to the subscription plans table. It also adds default durations:

- Monthly (1 month, 0% discount)
- Quarterly (3 months, 5% discount)
- Semi-Annual (6 months, 10% discount)
- Annual (12 months, 15% discount)

### UI Components

The subscription durations UI is integrated into the Products & Subscriptions management page, with a dedicated tab for billing cycles. Administrators can:

- View all billing cycles
- Create new billing cycles
- Edit existing billing cycles
- Delete billing cycles (if not in use)

## Best Practices

1. **Default Durations**: Always maintain at least one default duration (typically Monthly) to ensure subscription plans always have a valid duration option.

2. **Discount Strategy**: Use progressive discounts to incentivize longer subscription commitments. Typical discount structures might be:
   - Monthly: 0% (base price)
   - Quarterly: 5-10% discount
   - Semi-Annual: 10-15% discount
   - Annual: 15-20% discount

3. **Duration Naming**: Use clear, consistent naming for durations to avoid confusion. Include the time period in the name (e.g., "3-Month Plan" rather than just "Quarterly").

4. **Duration Days**: The `duration_days` field allows for more precise duration definitions when needed (e.g., 30 days instead of 1 month), but should be used sparingly to avoid confusion.

## Future Enhancements

Potential future enhancements to the subscription durations feature include:

1. **Trial Periods**: Add support for trial periods within subscription durations
2. **Custom Renewal Dates**: Allow setting specific renewal dates rather than just duration-based renewals
3. **Seasonal Durations**: Support for seasonal subscription options (e.g., summer-only subscriptions)
4. **Promotional Durations**: Time-limited special duration options for marketing campaigns
5. **Duration-Specific Benefits**: Allow defining additional benefits for longer subscription durations beyond just discounts
