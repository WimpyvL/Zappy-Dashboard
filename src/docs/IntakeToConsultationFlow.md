# Intake Form to Consultation Flow

This document describes the flow from a patient completing an intake form to a provider reviewing a consultation.

## Overview

When a patient selects a prescription product from the shop, they are directed to an intake form. After completing the form, a consultation is automatically created and assigned to a provider. The provider can then review the consultation, which includes AI-generated insights based on the intake form data.

## Components

### 1. Intake Form

The intake form (`src/pages/intake/IntakeFormPage.jsx`) is a multi-step process that collects:

- Basic information (height, weight, etc.)
- ID verification
- Health history
- Treatment preferences
- Shipping address
- Payment information

### 2. Consultation Service

The consultation service (`src/services/consultationService.js`) handles:

- Transforming intake form data to consultation format
- Generating AI summaries using the AI summarization feature
- Assigning providers using a round-robin approach
- Creating consultations in the database

### 3. AI Summarization

The AI summarization feature (`src/apis/ai/summaryService.js`) generates:

- Treatment recommendations with confidence scores
- Reasoning for the recommendations
- Assessment and plan based on the intake form data

## Flow

1. **Product Selection**:
   - Patient selects a prescription product from the shop
   - System determines the product category (weight management, ED, hair loss, etc.)
   - Patient is directed to the intake form

2. **Intake Form Completion**:
   - Patient completes the multi-step intake form
   - Form data is submitted and saved to the database

3. **Order Creation**:
   - System creates an order for the selected product
   - Order status is set to "pending" until the consultation is approved

4. **Consultation Creation**:
   - System transforms the intake form data to consultation format
   - AI summarization feature generates recommendations and reasoning
   - Provider is assigned using round-robin approach
   - Consultation is created in the database with "pending_review" status

5. **Provider Review**:
   - Provider sees the new consultation in their queue
   - Provider reviews the patient's information and AI-generated insights
   - Provider approves or rejects the consultation

6. **Post-Approval Flow**:
   - If approved, an invoice is generated for the patient
   - When the invoice is paid, the order is processed
   - Medication is shipped to the patient

## Implementation Details

### Intake Form Submission

```javascript
// Submit form data
const formSubmission = await submitFormMutation.mutateAsync({
  patientId: user?.id,
  categoryId: productCategory,
  formData: formData,
});
```

### Order Creation

```javascript
// Create order
const order = await createOrderMutation.mutateAsync({
  patientId: user?.id,
  items: [
    {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: 1,
      price: selectedProduct.price,
      dosage: selectedProduct.dosage,
      frequency: selectedProduct.frequency
    }
  ],
  formSubmissionId: formSubmission.id,
  shippingAddress: formData.shippingAddress,
  paymentMethodId: formData.checkout.paymentMethodId
});
```

### Consultation Creation

```javascript
// Create consultation
const consultation = await createConsultation({
  patientId: user?.id,
  formSubmissionId: formSubmission.id,
  formData: formData,
  categoryId: productCategory,
  orderId: order.id,
  productName: selectedProduct.name
});
```

### Provider Assignment

The provider assignment uses a round-robin approach to distribute consultations evenly among eligible providers:

```javascript
// Implement round-robin selection
lastAssignedProviderIndex = (lastAssignedProviderIndex + 1) % eligibleProviders.length;
const selectedProvider = eligibleProviders[lastAssignedProviderIndex];
```

### AI Summarization

The AI summarization feature generates recommendations and reasoning based on the intake form data:

```javascript
// Generate AI summary
const aiSummary = await generateIntakeSummary(formData, categoryId, 'initial');
```

## Database Schema

The flow involves the following database tables:

- `form_submissions`: Stores the intake form data
- `orders`: Stores the order information
- `consultations`: Stores the consultation information
- `ai_summaries`: Stores the AI-generated summaries

## Future Improvements

1. **Enhanced Provider Assignment**:
   - Consider provider workload and expertise
   - Allow patients to select preferred providers

2. **Real-time Notifications**:
   - Notify providers of new consultations
   - Notify patients of consultation status changes

3. **Automated Follow-ups**:
   - Schedule follow-up consultations automatically
   - Send reminders to patients for follow-ups