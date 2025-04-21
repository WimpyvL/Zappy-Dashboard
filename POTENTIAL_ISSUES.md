# Potential Issues Found in Codebase (TODO, FIXME, console.log)

This file lists all occurrences of `TODO`, `FIXME`, and `console.log` found in the `src` directory's `.js` and `.jsx` files. These markers often indicate areas needing review, debugging code left behind, or incomplete features.

---

**src/utils/auditLogService.js**
- `// TODO: This service assumes the frontend is responsible for initiating log entries.`
- `// TODO: Decide whether to call the API directly or use the mutation hook.`
- `//   console.log(\`[Audit Log (Dev)] Action: \${action}\`, details);`
- `    console.log(\`[Mock Audit Log] Action: \${action}\`, details); // Simulate logging`
- `    console.log(\`Audit event logged: \${action}\`, details); // Log success locally for debugging`

**src/pages/insurance/InsuranceDocumentation.jsx**
- `      console.log('Successfully fetched record details:', data);`
- `      console.log('Modal state:', {`
- `    console.log('Opening modal for record:', record);`
- `      console.log('Modal should be visible now');`
- `      console.log('Successfully transformed record:', formattedSelectedRecord);`

**src/pages/patients/PatientSubscriptions.jsx**
- `        // TODO: Update local state to reflect paused status if needed, ideally refetch data`
- `        // TODO: Update local state to reflect cancelled status, ideally refetch data`

**src/pages/patients/Patients.jsx**
- `                                 // TODO: Use tag.color for dynamic styling`

**src/pages/patients/PatientModal.jsx**
- `      console.log(\`Finding mock data for patient ID: \${editingPatientId}\`);`
- `        console.log("Found Mock Patient Data:", patientToEdit);`
- `        console.log('Attempting to update mock patient:', editingPatientId, patientPayload);`
- `        console.log('Attempting to create mock patient:', patientPayload);`

**src/pages/sessions/Sessions.js**
- `      console.log('Session status updated successfully');`
- `                {/* TODO: Populate providers dynamically */}`
- `                            {/* TODO: Implement Reschedule Modal/Logic */}`
- `                              {/* TODO: Implement Follow-up Logic */}`
- `                          {/* TODO: Link to note or implement review logic */}`
- `              {/* TODO: Replace with actual form using react-hook-form and fetch data */}`
- `                  // TODO: Implement session scheduling logic using useCreateSession mutation hook`

**src/pages/settings/pages/PatientNoteTemplateSettings.jsx**
- `      console.log('Deleting template (mock):', templateId);`
- `      // TODO: Add API call for deletion`
- `       console.log('Updating template (mock):', currentTemplate);`
- `       // TODO: Add API call for update`
- `       console.log('Adding template (mock):', newTemplate);`
- `       // TODO: Add API call for creation`

**src/pages/patients/PatientDetail.jsx**
- `      console.log(\`Finding patient \${patientId} in context...\`);`
- `          console.log("Found patient in context:", foundPatient);`
- `          // TODO: Fetch related data (sessions, orders, etc.) for this patient if needed`
- `       console.log("Waiting for context patients to load...");`
- `    console.log(\`Fetching related mock data for patient \${id}...\`);`
- `    // TODO: Adapt this to use mock data from context if needed`

**src/pages/settings/pages/forms/FormsManagement.jsx**
- `    // TODO: Update conditionals referencing deleted/shifted pages`

**src/pages/settings/pages/forms/FormViewer.jsx**
- `    console.log('Form submitted with data:', data);`

**src/pages/settings/pages/forms/FormConditionals.jsx**
- `        console.log('Validate Failed:', errorInfo);`

**src/pages/services/ServiceManagement.jsx**
- `    onSuccess: () => console.log('Service deleted'), // Add confirmation/notification`

**src/pages/orders/Orders.js**
- `      console.log('Order status updated successfully');`
- `              {/* TODO: Replace with actual form using react-hook-form and fetch data for selects */}`
- `                  // TODO: Implement order creation logic using useCreateOrder mutation hook`

**src/pages/messaging/MessagingPage.jsx**
- `    // TODO: Refresh conversation list after a new message/conversation is created`
- `    console.log('New conversation started/message sent - Refresh list');`

**src/pages/messaging/components/NewConversationModal.jsx**
- `      console.log('Sending new message payload:', payload);`

**src/pages/invoices/InvoicePage.jsx**
- `    console.log('Creating invoice with line items:', submissionData);`

**src/pages/Dashboard.js**
- `  console.log('Dashboard component rendering!');`
- `  // TODO: Replace placeholder consultations with data fetched via React Query hook (e.g., useConsultations)`
- `  // TODO: Replace placeholder tasks with data fetched via React Query hook (e.g., useTasks)`
- `        {/* TODO: Replace placeholder forms with data fetched via React Query hook (e.g., useForms) */}`

**src/pages/auditlog/AuditLogPage.jsx**
- `    // TODO: Add filters here if needed, e.g., filters: { userId: '...', action: '...' }`

**src/pages/consultations/InitialConsultations.js**
- `    console.log(`
- `    // TODO: Integrate with an email sending API/service`

**src/pages/consultations/InitialConsultationNotes.jsx**
- `  // TODO: Pass mutation hooks for saving/submitting if this component handles it`
- `  console.log('Refining product/dose selection state');`
- `  // TODO: Remove this when useServices hook provides correct data structure`
- `  console.log("All Services Data:", allServices);`
- `  console.log("Selected Service ID:", selectedServiceId);`
- `  console.log("Derived Plans for Service:", plansForSelectedService);`
- `    // TODO: Add filtering based on selectedServiceId if needed`
- `    console.log('Saving note with data:', saveData);`
- `     console.log("Submitting consultation for approval and invoicing:", submissionPayload);`
- `        // TODO: Potentially update the consultation status locally or refetch data`
- `                                  console.log(\`Rendering plan option: ID=\${planConfig.planId}, Name=\${getPlanName(planConfig.planId)}, Selected=\${selectedMed.planId}\`);`

**src/pages/common/LoadingState.jsx**
- `  console.log('LoadingState rendering:', { message, fullScreen });`
- `  console.log('TableSkeleton rendering:', { rows, columns });`
- `  console.log('CardSkeleton rendering:', { count });`

**src/pages/common/TagField.jsx**
- `// TODO: Import hooks for document, form, invoice tags when available`
- `      console.error('Failed to create tag:', error);`
- `      // TODO: Show error notification`
- `  // TODO: Add mutations for document, form, invoice`
- `      // TODO: Add cases for document, form, invoice`
- `      // TODO: Add cases for document, form, invoice`
- `          // TODO: Add checks for other entity types`

**src/index.js**
- `// to log results (for example: reportWebVitals(console.log))`

**src/constants/SidebarItems.js**
- `  action: () => console.log('Logging out...'),`

**src/context/AuthContext.jsx**
- `    console.log('AuthContext: Setting user data', userData);`
- `    console.log('AuthContext: Logging out');`
- `    console.log('AuthContext: Logout completed');`

**src/context/AppContext.jsx**
- `  const [documents] = useState([]); // Initialize empty - TODO: Add fetchDocuments (Removed unused setDocuments)`
- `  const [forms] = useState([]); // Initialize empty - TODO: Add fetchForms (Removed unused setForms)`
- `  const [invoices] = useState([]); // Initialize empty - TODO: Add fetchInvoices (Removed unused setInvoices)`
- `    console.log('Using mock patient data');`
- `    console.log('Using mock session data');`
- `    console.log('Using mock order data');`
- `    console.log('Using mock product data');`
- `    console.log('Using mock service data');`
- `    console.log('Using mock subscription plan data');`
- `    //        console.log("Fetched plans from API:", data);`
- `    console.log('Using mock tag data');`
- `  // TODO: Add mock fetchDocuments, fetchForms, fetchInvoices similarly if needed`
- `    console.log('Fetching initial mock data...');`
- `    // TODO: Call mock fetchDocuments(), fetchForms(), fetchInvoices() here`
- `    console.log('Finished fetching initial mock data.');`
- `    // TODO: Add fetchDocuments, fetchForms, fetchInvoices`

**src/apis/patients/hooks.js**
- `  console.log('Using mock patients data in usePatients hook');`
- `  console.log(\`Using mock patient data for ID: \${id} in usePatientById hook\`);`
- `      console.log('Mock Creating patient:', patientData);`
- `      console.log(\`Mock Updating patient \${id}:\`, patientData);`
- `      console.log(\`Mock Deleting patient \${id}\`);`

**src/apis/users/hooks.js**
- `  console.log('Using mock user profile data');`
- `      console.log('Mock Updating profile:', userData);`
- `      console.log('Mock Changing password (validation skipped)');`

**src/apis/tasks/hooks.js**
- `  console.log('Using mock tasks data');`
- `  console.log(\`Using mock task data for ID: \${id} in useTaskById hook\`);`
- `      console.log('Mock Creating task:', taskData);`
- `      console.log(\`Mock Updating task \${id}:\`, taskData);`
- `      console.log(\`Mock Deleting task \${id}\`);`
- `      console.log(\`Mock Marking task \${id} as completed\`);`
- `      console.log(\`Mock Creating session from task \${taskId}\`);`
- `      console.log('Mock Creating bulk sessions for tasks:', selectedRows);`
- `      console.log('Mock Archiving tasks:', selectedIds);`
- `  console.log('Using mock assignees data');`
- `  console.log('Using mock taskable patients data');`

**src/apis/tags/hooks.js**
- `  console.log('Using mock tags data in useTags hook');`
- `  console.log(\`Using mock tag data for ID: \${id} in useTagById hook\`);`
- `      console.log('Mock Creating tag:', tagData);`
- `      console.log(\`Mock Updating tag \${id}:\`, tagData);`
- `      console.log(\`Mock Deleting tag \${id}\`);`
- `  console.log(\`Using mock tag usage data for ID: \${id}\`);`

**src/apis/subscriptionPlans/hooks.js**
- `  console.log('Using mock subscription plans data in useSubscriptionPlans hook');`
- `  console.log(`
- `      console.log('Mock Creating subscription plan:', planData);`
- `      console.log(\`Mock Updating subscription plan \${id}:\`, planData);`
- `      console.log(\`Mock Deleting subscription plan \${id}\`);`

**src/apis/sessions/hooks.js**
- `  console.log('Using mock sessions data in useSessions hook');`
- `  console.log(\`Using mock session data for ID: \${id} in useSessionById hook\`);`
- `      console.log('Mock Creating session:', sessionData);`
- `      console.log(\`Mock Updating session \${id}:\`, sessionData);`
- `      console.log(\`Mock Updating session \${sessionId} status to: \${status}\`);`
- `      console.log(\`Mock Deleting session \${id}\`);`
- `      console.log(\`Mock Adding tag \${tagId} to session \${entityId}\`);`
- `      console.log(\`Mock Removing tag \${tagId} from session \${entityId}\`);`

**src/apis/services/hooks.js**
- `  console.log('Using mock services data in useServices hook');`
- `  console.log(\`Using mock service data for ID: \${id} in useServiceById hook\`);`
- `      console.log('Mock Creating service:', serviceData);`
- `      console.log(\`Mock Updating service \${id}:\`, serviceData);`
- `      console.log(\`Mock Deleting service \${id}\`);`

**src/apis/products/hooks.js**
- `  console.log('Using mock products data in useProducts hook');`
- `  console.log(\`Using mock product data for ID: \${id} in useProductById hook\`);`
- `      console.log('Mock Creating product:', productData);`
- `      console.log(\`Mock Updating product \${id}:\`, productData);`
- `      console.log(\`Mock Deleting product \${id}\`);`

**src/apis/pharmacies/hooks.js**
- `  console.log('Using mock pharmacies data in usePharmacies hook');`
- `  console.log(\`Using mock pharmacy data for ID: \${id} in usePharmacyById hook\`);`
- `      console.log('Mock Creating pharmacy:', pharmacyData);`
- `      console.log(\`Mock Updating pharmacy \${id}:\`, pharmacyData);`
- `      console.log(\`Mock Deleting pharmacy \${id}\`);`
- `      console.log(\`Mock Toggling pharmacy \${id} active status to: \${active}\`);`

**src/apis/orders/hooks.js**
- `  console.log('Using mock orders data in useOrders hook');`
- `  console.log(\`Using mock order data for ID: \${id} in useOrderById hook\`);`
- `      console.log('Mock Creating order:', orderData);`
- `      console.log(\`Mock Updating order \${id}:\`, orderData);`
- `      console.log(\`Mock Updating order \${orderId} status to: \${status}\`);`
- `      console.log(\`Mock Deleting order \${id}\`);`
- `      console.log(\`Mock Adding tag \${tagId} to order \${entityId}\`);`
- `      console.log(\`Mock Removing tag \${tagId} from order \${entityId}\`);`

**src/apis/notes/hooks.js**
- `  console.log(\`Using mock notes data for patient ID: \${patientId}\`);`
- `  console.log(\`Using mock note data for note ID: \${noteId}\`);`
- `      console.log(\`Mock Adding note for patient \${patientId}:\`, noteData);`
- `      console.log(\`Mock Updating note \${noteId}:\`, noteData);`
- `      console.log(\`Mock Deleting note \${noteId} for patient \${patientId}\`);`

**src/apis/invoices/hooks.js**
- `  console.log('Using mock invoices data in useInvoices hook');`
- `  console.log(\`Using mock invoice data for ID: \${id} in useInvoiceById hook\`);`
- `      console.log('Mock Creating invoice:', invoiceData);`
- `      console.log(\`Mock Updating invoice \${id}:\`, invoiceData);`
- `      console.log(\`Mock Deleting invoice \${id}\`);`
- `      console.log(\`Mock Marking invoice \${id} as paid\`);`
- `      console.log(\`Mock Sending invoice \${id}\`);`

**src/apis/insurances/hooks.js**
- `  console.log('Using mock insurance records data');`
- `  console.log(`
- `      console.log('Mock Creating insurance record:', recordData);`
- `      console.log(\`Mock Updating insurance record \${id}:\`, recordData);`
- `      console.log(\`Mock Uploading document for record \${id}: \${fileName}\`);`
- `      console.log(\`Mock Deleting document \${documentId} for record \${id}\`);`

**src/apis/forms/hooks.js**
- `  console.log('Using mock forms data in useForms hook');`
- `  console.log(\`Using mock form data for ID: \${id} in useFormById hook\`);`
- `      console.log('Mock Creating form:', formData);`
- `      console.log(\`Mock Updating form \${id}:\`, formData);`
- `      console.log(\`Mock Deleting form \${id}\`);`

**src/apis/discounts/hooks.js**
- `  console.log('Using mock discounts data in useDiscounts hook');`
- `  console.log(\`Using mock discount data for ID: \${id} in useDiscountById hook\`);`
- `      console.log('Mock Creating discount:', discountData);`
- `      console.log(\`Mock Updating discount \${id}:\`, discountData);`
- `      console.log(\`Mock Deleting discount \${id}\`);`
- `      console.log(\`Mock Toggling discount \${id} active status to: \${active}\`);`

**src/apis/auditlog/hooks.js**
- `  console.log('Using mock audit logs data');`
- `      // TODO: Use error handling utility`
- `      console.log('Mock Creating audit log:', logData);`
- `      // TODO: Use error handling utility`

**src/apis/consultations/hooks.js**
- `  console.log('Using mock consultations data in useConsultations hook');`
- `  console.log(`
- `      console.log(`

**src/apis/auditlog/api.js**
- `// TODO: Determine which api client setup to use (apiService.js or utils2/api.js)`
- `  console.log('Fetching audit logs with params:', params); // Placeholder log`
- `  console.log('Creating audit log:', logData); // Placeholder log`
