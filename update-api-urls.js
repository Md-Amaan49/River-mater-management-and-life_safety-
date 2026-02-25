// Script to update API URLs in advanced data pages
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000';

const pages = [
  'frontend/src/pages/StorageCapacity.jsx',
  'frontend/src/pages/ForecastMeteo.jsx',
  'frontend/src/pages/PredictiveSimulation.jsx',
  'frontend/src/pages/HistoricalRisk.jsx',
  'frontend/src/pages/StructuralHealth.jsx',
  'frontend/src/pages/GateSpillway.jsx',
  'frontend/src/pages/DownstreamRisk.jsx',
  'frontend/src/pages/BasinAggregated.jsx'
];

pages.forEach(pagePath => {
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Replace all occurrences of the Render.com URL with localhost
  content = content.replace(
    /https:\/\/river-water-management-and-life-safety\.onrender\.com/g,
    API_URL
  );
  
  // Add API_URL constant at the top if not already present
  if (!content.includes('const API_URL =')) {
    content = content.replace(
      'import "../styles/CoreDamInfo.css";',
      'import "../styles/CoreDamInfo.css";\n\nconst API_URL = "http://localhost:5000";'
    );
  }
  
  fs.writeFileSync(pagePath, content);
  console.log(`✅ Updated ${pagePath}`);
});

console.log('\n✨ All pages updated successfully!');
