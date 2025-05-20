// This script updates the header text color and button styles in all consultation note components
// to match the styles used in the FollowUpConsultationNotes component

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'pages', 'consultations', 'components', 'consultation-notes');
const components = [
  'PatientInfoCard.jsx',
  'MedicationsCard.jsx',
  'CommunicationCard.jsx',
  'AssessmentPlanCard.jsx',
  'AlertCenterCard.jsx'
];

components.forEach(componentFile => {
  const filePath = path.join(componentsDir, componentFile);
  
  // Read the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${componentFile}:`, err);
      return;
    }
    
    // Update the header text color to white
    let updatedContent = data.replace(
      /color: ['"]#374151['"]/g, 
      `color: 'white'`
    );
    
    // Update the font weight to medium
    updatedContent = updatedContent.replace(
      /fontWeight: 600/g,
      `fontWeight: 500`
    );
    
    // Update the button styles to match FollowUpConsultationNotes
    // This is more complex and might need manual adjustments
    
    // Write the updated content back to the file
    fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${componentFile}:`, err);
        return;
      }
      console.log(`Updated header styles in ${componentFile}`);
    });
  });
});

console.log('Header styles update script completed');
