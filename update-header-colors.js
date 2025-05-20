// This script updates the header background color in all consultation note components
// to match the color used in the top header (#4f46e5)

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

// The color to update to
const newHeaderColor = '#4f46e5'; // Indigo color from the top header

components.forEach(componentFile => {
  const filePath = path.join(componentsDir, componentFile);
  
  // Read the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${componentFile}:`, err);
      return;
    }
    
    // Replace the backgroundColor in the header style
    const updatedContent = data.replace(
      /backgroundColor: ['"]#f9fafb['"]/g, 
      `backgroundColor: '${newHeaderColor}'`
    ).replace(
      /backgroundColor: ['"]#f3f4f6['"]/g, 
      `backgroundColor: '${newHeaderColor}'`
    );
    
    // Also update the text color to white
    const finalContent = updatedContent.replace(
      /color: ['"]#374151['"]/g,
      `color: 'white'`
    );
    
    // Write the updated content back to the file
    fs.writeFile(filePath, finalContent, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing file ${componentFile}:`, err);
        return;
      }
      console.log(`Updated header color in ${componentFile}`);
    });
  });
});

console.log('Header color update script completed');
