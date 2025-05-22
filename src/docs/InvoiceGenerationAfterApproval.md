# Invoice Generation After Consultation Approval

This document describes the process of generating invoices after a provider approves a consultation.

## Overview

When a provider reviews a consultation and approves it, the system automatically generates an invoice for the patient. This invoice includes the cost of the subscription plan associated with the product the patient selected during the intake process.

## Components

### 1. Consultation Approval Service

The consultation approval service (`src/services/consultationInvoiceService.js`) handles:

- Processing consultation approvals
- Generating invoices after approval
- Linking consultations, orders, and invoices
- Handling subscription plan assignment

### 2. Invoice Service

The invoice service (`src/services/invoiceService.js`) is responsible for:

- Creating invoices based on consultation and order data
- Calculating totals, taxes, and discounts
- Supporting different subscription plans
- Saving invoices to the database

### 3. React Hooks

The system provides React hooks for interacting with the services:

- `useInvoiceService`: For generating and managing invoices
- `useConsultationApproval`: For approving consultations and generating invoices

### 4. UI Components

- `ApprovalNotesModal`: A modal dialog for entering approval notes before approving a consultation
- `ConsultationFooter`: Updated to include an approval button for consultations in the "pending_review" status

## Flow

1. **Provider Reviews Consultation**:
   - Provider reviews the patient's consultation data
   - Provider clicks the "Approve & Generate Invoice" button

2. **Approval Notes**:
   - System displays the approval notes modal
   - Provider enters any notes about the approval
   - Provider confirms the approval

3. **Invoice Generation**:
   - System retrieves the subscription plan associated with the product
   - System calculates the invoice amount based on the subscription plan
   - System creates an invoice with the patient's information
   - System links the invoice to the consultation and order

4. **Post-Approval Actions**:
   - Consultation status is updated to "approved"
   - Patient is notified of the approval and invoice
   - Invoice is sent to the patient for payment

5. **Payment Processing**:
   - Patient receives the invoice
   - Patient pays the invoice
   - System marks the invoice as paid
   - System updates the order status to "processing"

## Database Schema

The system uses the following database tables:

- `consultations`: Stores consultation data, linked to invoices via `invoice_id`
- `pb_invoices`: Stores invoice data, linked to consultations via `consultation_id`
- `orders`: Stores order data, linked to invoices via `invoice_id`
- `product_subscription_plans`: Maps products to subscription plans

## Implementation Details

### Approving a Consultation

```javascript
const handleApproveConsultation = async (notes) => {
  await approveConsultation({
    consultationId,
    approverId: currentUser.id,
    approvalData: {
      notes: notes
    }
  });
};
```

### Generating an Invoice

```javascript
const consultation = await createConsultationFromIntake({
  patientId,
  formSubmissionId,
  formData,
  categoryId,
  orderId,
  productName
});
```

### Database Triggers

The system uses database triggers to automate actions when an invoice is paid:

1. `update_order_status_on_invoice_paid_trigger`: Updates the order status to "processing" when the invoice is paid
2. `update_subscription_status_on_invoice_paid_trigger`: Updates the subscription status to "active" when the invoice is paid

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