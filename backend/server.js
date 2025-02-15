const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

const app = express();
const port = 5001;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/secretsanta', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.post('/api/secret_santa', upload.fields([
  { name: 'csvFile', maxCount: 1 },
  { name: 'previousAssignments', maxCount: 1 }
]), (req, res) => {
  if (!req.files['csvFile']) {
    return res.status(400).send('No employee file uploaded');
  }

  const employees = [];
  const csvData = req.files['csvFile'][0].buffer.toString('utf8');
  let previousAssignmentsData = '';

  if (req.files['previousAssignments']) {
    previousAssignmentsData = req.files['previousAssignments'][0].buffer.toString('utf8');
  }

  Readable.from(csvData)
    .pipe(csvParser())
    .on('data', (data) => employees.push({
      name: data.Employee_Name,
      email: data.Employee_EmailID
    }))
    .on('end', () => {
      try {
        const assignments = assignSecretSantas(employees, previousAssignmentsData);
        res.json({ 
          message: 'Secret Santa assignments generated', 
          assignments: assignments 
        });
      } catch (error) {
        res.status(400).json({ 
          message: 'Failed to generate assignments', 
          error: error.message 
        });
      }
    });
});

function assignSecretSantas(employeeList, previousAssignmentsText) {
  const previousPairs = new Map();
  
  // Parse previous assignments if provided
  if (previousAssignmentsText) {
    const previousLines = previousAssignmentsText.split('\n');
    const headers = previousLines[0].split(',');
    
    for (let i = 1; i < previousLines.length; i++) {
      const line = previousLines[i].trim();
      if (line) {
        const values = line.split(',');
        const santaName = values[0];
        const childName = values[2];
        if (santaName && childName) {
          previousPairs.set(santaName, childName);
        }
      }
    }
  }

  function isValidAssignment(santa, child, assignments) {
    // Check if santa is not choosing themselves
    if (santa.name === child.name) return false;
    
    // Check if this pair was assigned last year
    if (previousPairs.has(santa.name) && previousPairs.get(santa.name) === child.name) return false;
    
    // Check if child is already assigned to someone else in current assignments
    return !Object.values(assignments).some(a => a.Secret_Child_Name === child.name);
  }

  function findValidAssignment(employeeList) {
    const assignments = {};
    const available = new Set(employeeList.map(e => e.name));
    
    function assignRecursively(santa) {
      if (!available.size) return true;
      
      const possibleChildren = employeeList.filter(child => 
        available.has(child.name) && isValidAssignment(santa, child, assignments)
      );
      
      // Shuffle possible children for randomness
      for (let i = possibleChildren.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [possibleChildren[i], possibleChildren[j]] = [possibleChildren[j], possibleChildren[i]];
      }
      
      for (const child of possibleChildren) {
        available.delete(child.name);
        assignments[santa.name] = {
          Employee_Name: santa.name,
          Employee_EmailID: santa.email,
          Secret_Child_Name: child.name,
          Secret_Child_EmailID: child.email
        };
        
        const nextSanta = employeeList.find(e => !assignments[e.name]);
        if (!nextSanta || assignRecursively(nextSanta)) {
          return true;
        }
        
        delete assignments[santa.name];
        available.add(child.name);
      }
      
      return false;
    }
    
    // Shuffle employee list for randomness
    const shuffledEmployees = [...employeeList];
    for (let i = shuffledEmployees.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledEmployees[i], shuffledEmployees[j]] = [shuffledEmployees[j], shuffledEmployees[i]];
    }
    
    if (assignRecursively(shuffledEmployees[0])) {
      return assignments;
    }
    return null;
  }

  // Try to find a valid assignment
  const assignments = findValidAssignment(employeeList);
  if (!assignments) {
    throw new Error('No valid assignment found that satisfies all constraints');
  }
  
  return Object.values(assignments);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});