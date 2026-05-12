const fs = require('fs');
const Papa = require('papaparse');

const csvContent = fs.readFileSync('/Users/indrajeetprasad/Documents/Git-Repos/Test-Case-Crm/Admin-Panel Sheet - client (1).csv', 'utf8');

Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    console.log('Total records found:', results.data.length);
    console.log('Errors:', results.errors.length);
    if (results.errors.length > 0) {
      console.log('First 5 errors:', results.errors.slice(0, 5));
    }
    
    // Check if some records are missing mandatory fields
    const missingAction = results.data.filter(r => !r.Action);
    console.log('Records missing Action:', missingAction.length);
    
    const missingSteps = results.data.filter(r => !r['Steps/Description']);
    console.log('Records missing Steps:', missingSteps.length);

    // Print all Test Case IDs found
    const ids = results.data.map(r => r['Test Case Id']);
    console.log('Found IDs:', ids);
  }
});
