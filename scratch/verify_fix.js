const fs = require('fs');
const Papa = require('papaparse');

// Replicate the signature logic
const getSignature = (action, conditions, steps) => {
  return `${action.trim().toLowerCase()}|${conditions.trim().toLowerCase()}|${steps.trim().toLowerCase()}`;
};

const csvContent = fs.readFileSync('/Users/indrajeetprasad/Documents/Git-Repos/Test-Case-Crm/Admin-Panel Sheet - client (1).csv', 'utf8');

Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    const data = results.data;
    console.log('Total records in CSV:', data.length);

    const seenInBatch = new Set();
    let duplicateCount = 0;
    let newCount = 0;

    for (const item of data) {
      const action = (item.Action || "").toString();
      const conditions = (item["Cases/Conditions"] || "").toString();
      const steps = (item["Steps/Description"] || "").toString();
      
      if (!action && !conditions && !steps) continue;

      const signature = getSignature(action, conditions, steps);

      if (seenInBatch.has(signature)) {
        duplicateCount++;
      } else {
        seenInBatch.add(signature);
        newCount++;
      }
    }

    console.log('Results of parsing:');
    console.log('- Unique Records to process:', newCount);
    console.log('- Duplicates within file:', duplicateCount);
    
    if (newCount + duplicateCount === data.length) {
       console.log('SUCCESS: All rows accounted for.');
    } else {
       console.log('WARNING: Row count mismatch!');
    }
  }
});
