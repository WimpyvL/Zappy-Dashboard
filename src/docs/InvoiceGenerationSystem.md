# Invoice Generation System

This document describes the invoice generation system for the Telehealth platform.

## Overview

The invoice generation system automatically creates invoices after a provider approves a consultation. These invoices are sent to patients for payment, and once paid, the order is processed and the medication is shipped to the patient.

## Components

### 1. Invoice Service

The invoice service (`src/services/invoiceService.js`) is responsible for generating and managing invoices. It provides functions for:

- Generating invoices from consultations
- Generating subscription renewal invoices
- Calculating taxes, discounts, and totals
- Marking invoices as paid

### 2. Consultation Invoice Service

The consultation invoice service (`src/services/consultationInvoiceService.js`) connects consultations to invoices. It:

- Processes consultation approvals
- Generates invoices after approval
- Links consultations, orders, and invoices
- Handles subscription plan assignment

### 3. Hooks

The system provides React hooks for interacting with the services:

- `useInvoiceService`: For generating and managing invoices
- `useConsultationApproval`: For approving consultations and generating invoices

### 4. Database Schema

The system uses the following database tables:

- `pb_invoices`: Stores invoice data
- `consultations`: Linked to invoices via `invoice_id`
- `orders`: Linked to invoices via `invoice_id`
- `product_subscription_plans`: Maps products to subscription plans

## Flow

1. **Consultation Approval**:
   - Provider reviews and approves a consultation
   - System generates an invoice based on the consultation and order

2. **Invoice Generation**:
   - System determines if the product is associated with a subscription plan
   - Calculates the total amount, including any taxes and discounts
   - Creates an invoice with line items from the order
   - Links the invoice to the consultation and order

3. **Payment Processing**:
   - Patient receives notification about the invoice
   - Patient pays the invoice
   - System marks the invoice as paid

4. **Post-Payment Actions**:
   - When an invoice is marked as paid, database triggers update:
     - Order status to "processing"
     - Subscription status to "active" (if applicable)

## Implementation Details

### Generating an Invoice from a Consultation

```javascript
const result = await generateInvoiceFromConsultation({
  consultation,
  order,
  subscriptionPlan,
  taxRate: 0,
  discountPercentage: 0
});
```

### Approving a Consultation

```javascript
const { approveConsultation } = useConsultationApproval();

const handleApprove = async () => {
  await approveConsultation({
    consultationId,
    approverId: currentUser.id,
    approvalData: {
      notes: approvalNotes
    }
  });
};
```

### Marking an Invoice as Paid

```javascript
const { markAsPaid } = useInvoiceService();

const handlePayment = async () => {
  await markAsPaid(invoiceId, {
    paymentMethod: 'credit_card',
    paymentId: 'pm_123456789'
  });
};
```

## Database Triggers

The system uses database triggers to automate actions when an invoice is paid:

1. `update_order_status_on_invoice_paid_trigger`: Updates the order status to "processing" when the invoice is paid
2. `update_subscription_status_on_invoice_paid_trigger`: Updates the subscription status to "active" when the invoice is paid

## Subscription Plans

Products can be associated with subscription plans through the `product_subscription_plans` table. When a patient purchases a product with an associated subscription plan:

1. An invoice is generated for the initial payment
2. When the invoice is paid, the patient is enrolled in the subscription plan
3. Renewal invoices are generated automatically based on the subscription plan's billing cycle

## Future Improvements

1. **Payment Gateway Integration**:
   - Connect to a payment gateway for real-time payment processing
   - Support multiple payment methods

2. **Automated Reminders**:
   - Send reminders for unpaid invoices
   - Implement a grace period for late payments

3. **Subscription Management**:
   - Allow patients to upgrade/downgrade subscription plans
   - Support pausing and resuming subscriptions

4. **Reporting**:
   - Generate financial reports
   - Track revenue by product, category, or time period