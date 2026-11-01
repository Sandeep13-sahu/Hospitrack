const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'modules', 'PatientClinicalChart.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const target = `    } else {
      setEditingMedId(null);
      setDrugName('');
      setDrugSearchQuery('');
      setDosage('500mg');
      setFormType('Tablet');
      setFrequency('Twice Daily [BD]');
      setRoute('Oral');
      setTiming('After Meals');
      setDurationDays(5);
      setSpecialInstructions('');
    }`;

const replacement = `    } else {
      setEditingMedId(null);
      setDrugName('');
      setDrugSearchQuery('');
      setDosage('');
      setFormType('Tablet');
      setFrequency('');
      setRoute('Oral');
      setTiming('');
      setDurationDays(0);
      setSpecialInstructions('');
    }`;

const normalize = s => s.replace(/\r\n/g, '\n');
let normCode = normalize(code);

if (normCode.includes(normalize(target))) {
  normCode = normCode.replace(normalize(target), normalize(replacement));
  fs.writeFileSync(filePath, normCode.replace(/\n/g, '\r\n'), 'utf8');
  console.log('[OK] PatientClinicalChart.tsx updated successfully');
} else {
  console.error('[ERROR] target not found in PatientClinicalChart.tsx');
}

