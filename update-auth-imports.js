/**
 * Script to update all imports from the old AuthContext path to the new one
 */
const fs = require('fs');
const path = require('path');

// Files to update based on our search results
const filesToUpdate = [
  'src/pages/billing/PatientBillingPage.jsx',
  'src/pages/messaging/components/NewConversationModal.jsx',
  'src/pages/messaging/MessagingPage.jsx',
  'src/pages/notes/PatientNotesPage.jsx',
  'src/pages/notes/MedicalNotes.jsx',
  'src/pages/profile/PatientProfilePage.jsx',
  'src/pages/consultations/InitialConsultationNotes.jsx.bak',
  'src/pages/profile/EditProfilePage.jsx',
  'src/pages/profile/ChangePasswordPage.jsx',
  'src/pages/providers/ProviderManagement.jsx',
  'src/pages/auth/Login.jsx',
  'src/pages/auth/Signup.jsx',
  'src/pages/settings/pages/ReferralSettings.jsx',
  'src/pages/patients/PatientFollowUpNotes.jsx',
  'src/pages/patients/PatientSubscriptionPage.jsx',
  'src/pages/patients/PatientServicesEmptyState.jsx',
  'src/pages/patients/PatientSubscriptionContent.jsx',
  'src/pages/patients/PatientDashboardPage.jsx',
  'src/pages/patients/PatientProgramContent.jsx',
  'src/pages/patients/ProgramsPage.jsx',
  'src/components/patient/services/ServicesHeader.jsx',
  'src/components/patient/services/PatientServicesHeader.jsx',
  'src/apis/users/hooks.js',
  'src/apis/auth/hooks.js',
  'src/apis/referrals/hooks.js'
];

// Function to update imports in a file
function updateImportsInFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');

    // Replace old import with new import
    const updatedContent = content.replace(
      /import\s+\{\s*useAuth\s*\}\s+from\s+['"]\.\.\/\.\.\/context\/AuthContext['"]/g,
      "import { useAuth } from '../../contexts/auth/AuthContext'"
    ).replace(
      /import\s+\{\s*useAuth\s*\}\s+from\s+['"]\.\.\/\.\.\/\.\.\/context\/AuthContext['"]/g,
      "import { useAuth } from '../../../contexts/auth/AuthContext'"
    );

    // Write updated content back to file
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in: ${filePath}`);
    } else {
      console.log(`No changes needed in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Update imports in all files
console.log('Updating AuthContext imports...');
filesToUpdate.forEach(updateImportsInFile);
console.log('Done!');
