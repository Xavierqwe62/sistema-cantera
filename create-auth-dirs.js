const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'cantera-system', 'backend');
const dirs = [
  path.join(baseDir, 'config'),
  path.join(baseDir, 'controllers'),
  path.join(baseDir, 'middleware'),
  path.join(baseDir, 'utils'),
  path.join(baseDir, 'routes')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created: ' + dir);
  }
});

console.log('All directories created successfully');
