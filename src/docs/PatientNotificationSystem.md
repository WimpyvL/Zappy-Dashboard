# Patient Notification System

This document describes the patient notification system implemented in the Telehealth application. The system allows providers to notify patients when consultation notes are submitted and provides a way for patients to view these notifications in the patient portal.

## Overview

The patient notification system consists of the following components:

1. **Notification Service**: A service that handles creating and managing patient notifications
2. **Patient Notifications Component**: A UI component that displays notifications to patients
3. **Database Tables**: Tables for storing notifications and tracking delivery status
4. **Integration with Consultation Notes**: Automatic notification when a consultation note is submitted

## Database Schema

The system uses the following database tables:

### patient_notifications

Stores notifications sent to patients.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| patient_id | UUID | Foreign key to patients table |
| reference_id | UUID | ID of the referenced entity (e.g., consultation note ID) |
| reference_type | TEXT | Type of the referenced entity (e.g., 'consultation_note') |
| type | TEXT | Notification type (e.g., 'new_note') |
| title | TEXT | Notification title |
| message | TEXT | Notification message |
| is_read | BOOLEAN | Whether the notification has been read |
| read_at | TIMESTAMP | When the notification was read |
| created_at | TIMESTAMP | When the notification was created |
| updated_at | TIMESTAMP | When the notification was last updated |

### notification_deliveries

Tracks the delivery status of notifications across different channels.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| notification_id | UUID | Foreign key to patient_notifications table |
| channel | TEXT | Delivery channel (e.g., 'email', 'sms', 'portal') |
| recipient | TEXT | Recipient address (e.g., email address, phone number) |
| status | TEXT | Delivery status (e.g., 'sent', 'delivered', 'failed') |
| sent_at | TIMESTAMP | When the notification was sent |
| delivered_at | TIMESTAMP | When the notification was delivered |
| error_message | TEXT | Error message if delivery failed |
| metadata | JSONB | Additional metadata |

## Notification Service

The notification service (`src/services/notificationService.js`) provides the following functions:

### notifyPatientOfNewNote

Notifies a patient that a new consultation note is available.

```javascript
const result = await notifyPatientOfNewNote({
  patientId: 'patient-uuid',
  noteId: 'note-uuid',
  templateId: 'template-id' // Optional
});
```

### getPatientNotifications

Gets all notifications for a patient.

```javascript
const notifications = await getPatientNotifications('patient-uuid');
```

### markNotificationAsRead

Marks a notification as read.

```javascript
await markNotificationAsRead('notification-uuid');
```

### getPatientNotificationPreferences

Gets notification preferences for a patient.

```javascript
const preferences = await getPatientNotificationPreferences('patient-uuid');
```

### updatePatientNotificationPreferences

Updates notification preferences for a patient.

```javascript
await updatePatientNotificationPreferences('patient-uuid', {
  channels: ['email', 'sms', 'portal'],
  frequency: 'immediate'
});
```

## Patient Notifications Component

The `PatientNotifications` component (`src/components/patient/notifications/PatientNotifications.jsx`) displays notifications for a patient. It includes:

- A list of notifications with unread notifications highlighted
- The ability to mark notifications as read
- A toggle to show all notifications or only unread notifications
- A button to mark all notifications as read

## Integration with Consultation Notes

When a provider submits a consultation note, the system automatically notifies the patient. This is implemented in the `handleSubmit` function in `src/pages/consultations/InitialConsultationNotes.jsx`.

## Database Migration

The database migration script (`supabase/migrations/20250519_add_patient_notifications.sql`) creates the necessary tables and functions for the notification system. You can apply this migration using the `apply-patient-notifications-migration.sh` script:

```bash
./apply-patient-notifications-migration.sh
```

## Row-Level Security

The notification system includes row-level security policies to ensure that:

- Providers can see all notifications
- Patients can only see their own notifications

## Future Enhancements

Potential future enhancements to the notification system include:

1. **Push Notifications**: Add support for push notifications to mobile devices
2. **Notification Templates**: Add more templates for different types of notifications
3. **Notification Preferences**: Allow patients to set preferences for which notifications they receive and how
4. **Notification Analytics**: Track notification open rates and engagement
5. **Scheduled Notifications**: Add support for scheduling notifications in advance
