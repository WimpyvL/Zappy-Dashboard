# Prescription Tracking System

This document outlines the prescription tracking system implemented in the Zappy Health platform. The system provides end-to-end tracking of prescription medications from submission to delivery, with email notifications at key stages and a visual timeline for patients to track their prescription status.

## Components

### 1. PrescriptionStatusTimeline

The `PrescriptionStatusTimeline` component provides a visual representation of a prescription's journey through the system. It shows each step in the process, from submission to delivery, with timestamps and status indicators.

**Location:** `src/components/orders/PrescriptionStatusTimeline.jsx`

**Features:**
- Visual timeline with icons representing each step
- Color-coded status indicators
- Timestamps for each status change
- Compact view option for embedding in other components
- Special handling for denied prescriptions
- Contextual information based on current status

**Usage:**
```jsx
<PrescriptionStatusTimeline 
  prescriptionId="123"
  status="approved"
  events={[
    { status: 'submitted', timestamp: '2025-05-20T10:30:00Z' },
    { status: 'under_review', timestamp: '2025-05-20T14:45:00Z' },
    { status: 'approved', timestamp: '2025-05-21T09:15:00Z' }
  ]}
  compact={false}
/>
```

### 2. OrderDetailModal with Prescription Timeline

The `OrderDetailModal` component has been enhanced to display the prescription timeline for orders containing prescription medications.

**Location:** `src/components/orders/OrderDetailModal.jsx`

**Changes:**
- Added conditional rendering of the `PrescriptionStatusTimeline` component
- Detection of prescription orders based on order metadata
- Integration with the existing order details UI

## Services

### 1. Shipping Tracking Service

The `shippingTrackingService` provides integration with shipping carriers (UPS, FedEx, USPS) to track packages and update order status in the database.

**Location:** `src/services/shippingTrackingService.js`

**Features:**
- Automatic carrier detection based on tracking number format
- Integration with UPS, FedEx, and USPS APIs
- Normalization of tracking data from different carriers
- Order status updates based on tracking information
- Tracking history storage and retrieval
- Scheduled tracking updates

**Key Functions:**
- `trackPackage(trackingNumber, carrier)`: Track a package using the appropriate carrier API
- `updateOrderStatusFromTracking(orderId, trackingNumber)`: Update order status based on tracking information
- `getOrderTrackingHistory(orderId)`: Get tracking history for an order
- `scheduleTrackingUpdates(orderId, trackingNumber, intervalHours)`: Schedule tracking updates for an order

**Usage:**
```javascript
import shippingTrackingService from '../../services/shippingTrackingService';

// Track a package
const trackingInfo = await shippingTrackingService.trackPackage('1Z999AA10123456784');

// Update order status from tracking
const result = await shippingTrackingService.updateOrderStatusFromTracking('order-123', '1Z999AA10123456784');

// Get tracking history
const history = await shippingTrackingService.getOrderTrackingHistory('order-123');
```

### 2. Email Notification Service

The `emailNotificationService` provides email notification functionality using SendGrid, with templates for various prescription and order status updates.

**Location:** `src/services/emailNotificationService.js`

**Features:**
- Integration with SendGrid API
- Templated emails for different prescription and order statuses
- Email notification logging in the database
- Patient email lookup from patient ID

**Key Functions:**
- `sendOrderConfirmationEmail(options)`: Send order confirmation email
- `sendOrderShippedEmail(options)`: Send order shipped email
- `sendPrescriptionStatusEmail(options)`: Send prescription status update email
- `sendRefillReminderEmail(options)`: Send refill reminder email

**Usage:**
```javascript
import emailNotificationService from '../../services/emailNotificationService';

// Send order confirmation email
await emailNotificationService.sendOrderConfirmationEmail({
  orderId: 'order-123',
  recipientEmail: 'patient@example.com'
});

// Send prescription status email
await emailNotificationService.sendPrescriptionStatusEmail({
  prescriptionId: 'prescription-123',
  status: 'approved',
  recipientEmail: 'patient@example.com',
  providerName: 'Dr. Smith'
});
```

## Database Schema Updates

### 1. Order Tracking Events

The system stores tracking events in the `order_tracking_events` table to maintain a history of status changes.

**Schema:**
```sql
CREATE TABLE order_tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  tracking_number TEXT,
  status TEXT NOT NULL,
  carrier TEXT,
  tracking_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### 2. Email Notifications

The system logs email notifications in the `email_notifications` table for auditing and troubleshooting.

**Schema:**
```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_id UUID,
  order_id UUID,
  prescription_id UUID,
  metadata JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL
);
```

### 3. Tracking Update Schedule

The system schedules tracking updates in the `tracking_update_schedule` table.

**Schema:**
```sql
CREATE TABLE tracking_update_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  tracking_number TEXT NOT NULL,
  interval_hours INTEGER NOT NULL DEFAULT 24,
  next_update TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

## Configuration

### 1. SendGrid API

The email notification service requires SendGrid API credentials to be configured in the environment variables:

```
REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key
REACT_APP_SENDGRID_FROM_EMAIL=notifications@zappy.health
REACT_APP_SENDGRID_FROM_NAME=Zappy Health
```

### 2. Shipping Carrier APIs

The shipping tracking service requires API credentials for each carrier to be configured in the environment variables:

```
# UPS
REACT_APP_UPS_API_URL=https://onlinetools.ups.com/api
REACT_APP_UPS_CLIENT_ID=your_ups_client_id
REACT_APP_UPS_CLIENT_SECRET=your_ups_client_secret

# FedEx
REACT_APP_FEDEX_API_URL=https://apis.fedex.com
REACT_APP_FEDEX_CLIENT_ID=your_fedex_client_id
REACT_APP_FEDEX_CLIENT_SECRET=your_fedex_client_secret

# USPS
REACT_APP_USPS_API_URL=https://secure.shippingapis.com/ShippingAPI.dll
REACT_APP_USPS_USER_ID=your_usps_user_id
```

## Integration Points

### 1. Order Management System

The prescription tracking system integrates with the existing order management system through the following points:

- Order status updates based on prescription status
- Prescription status updates based on order status
- Email notifications triggered by status changes
- Tracking information displayed in order details

### 2. Patient Portal

The prescription tracking system is exposed to patients through the following interfaces:

- Order details page with prescription timeline
- Email notifications for prescription status updates
- Refill reminders and requests

## Future Enhancements

1. **Mobile Push Notifications**: Add support for mobile push notifications for prescription status updates.
2. **SMS Notifications**: Add support for SMS notifications for prescription status updates.
3. **Pharmacy Integration**: Integrate with pharmacy systems for real-time prescription status updates.
4. **Prescription Transfer**: Add support for transferring prescriptions between pharmacies.
5. **Medication Adherence Tracking**: Add support for tracking medication adherence and sending reminders.
