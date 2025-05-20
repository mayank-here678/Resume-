import  { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

console.log(`${colors.blue}🚀 Starting deployment process...${colors.reset}`);

// Build the React application
console.log(`${colors.yellow}📦 Building the application...${colors.reset}`);
execSync('npm run build', { stdio: 'inherit' });

// Create a deploy directory if it doesn't exist
const deployDir = path.resolve('deploy');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
}

// Copy the dist contents to the deploy directory
console.log(`${colors.yellow}📋 Copying build files to deploy directory...${colors.reset}`);
execSync('cp -r dist/* deploy/', { stdio: 'inherit' });

// Create a simple server file for local testing
const serverFile = path.join(deployDir, 'server.js');
fs.writeFileSync(
  serverFile,
  `
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

http.createServer((req, res) => {
  console.log('Request: ' + req.url);
  
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if(error.code === 'ENOENT') {
        fs.readFile('./index.html', (error, content) => {
          if (error) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}).listen(port);

console.log(\`Server running at http://localhost:\${port}/\`);
`
);

// Generate a README with deployment instructions
const readmeFile = path.join(deployDir, 'README.md');
fs.writeFileSync(
  readmeFile,
  `# Mayank Mathur - Developer Portfolio

This is the deployed version of Mayank Mathur's portfolio website.

## Local Testing

To test this website locally:

1. Make sure you have Node.js installed
2. Open a terminal in this directory
3. Run: \`node server.js\`
4. Open a browser and navigate to: \`http://localhost:8080\`

## Deployment Options

### Option 1: GitHub Pages (Free)

1. Create a new GitHub repository
2. Push these files to the repository
3. Go to repository Settings > Pages
4. Select the main branch as the source
5. Your site will be published at: \`https://[username].github.io/[repository-name]\`

### Option 2: Netlify or Vercel (Free)

1. Create an account on [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/)
2. Create a new site and upload these files or connect to your GitHub repository
3. Your site will be deployed automatically with a URL provided by the service

### Option 3: Any Static Web Hosting

Since this is a static website, it can be hosted on any web hosting service that supports static HTML files.
Simply upload all the files in this directory to your web host's public directory.
`
);

// Create a zip file of the deploy directory for easy sharing
console.log(`${colors.yellow}📦 Creating deployment package...${colors.reset}`);
execSync('cd deploy && zip -r ../portfolio-deploy.zip .', { stdio: 'inherit' });

console.log(`${colors.green}✅ Deployment files prepared successfully!${colors.reset}`);
console.log(`${colors.magenta}📋 Instructions:${colors.reset}`);
console.log(`   1. The 'portfolio-deploy.zip' file contains all deployment files`);
console.log(`   2. Extract this file and upload to any static hosting service`);
console.log(`   3. For testing locally, navigate to the 'deploy' directory and run 'node server.js'`);
console.log(`   4. See the README.md in the deploy directory for more deployment options`);
 