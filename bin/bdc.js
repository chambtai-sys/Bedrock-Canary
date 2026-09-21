#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const { transpileBDC } = require('../src/index.js');

const ASCII_LOGO = `
    ____           ZH,                          ,HZ
   / __ )___  ____/ /_______  ________  __     /  /
  / __  / _ \\/ __  / ___/ _ \\/ ___/ / / /    /  /
 / /_/ /  __/ /_/ / /  /  __/ /__/ /_/ /    /  /
/_____/\\___/\\__,_/_/   \\___/\\___/\\__,_/    /__/
   ______
  / ____/____ _____  ____ ________  __       ____  ______ _____ ______  __
 / /   / __ \`/ __ \\/ __ \`/ ___/ / / /      / __ \\/ __ \`/ ___// __ \\/ / / /
/ /___/ /_/ / / / / /_/ / /  / /_/ /      / /_/ / /_/ / /   / /_/ / /_/ /
\\____/\\__,_/_/ /_/\\__,_/_/   \\__, /      / .___/\\__,_/_/   / .___/\\__, /
                             /____/      /_/              /_/    /____/
                                 [ BETA ]
================================================================================
   Bedrock Canary (.bdc) - Programming Language for Web & Mobile Apps
================================================================================
`;

const args = process.argv.slice(2);
const command = args[0] || 'welcome';

function showHelp() {
  console.log(ASCII_LOGO);
  console.log(`
Usage: bdc <command> [options] [file.bdc]

Commands:
  run <file.bdc>       Transpile and open .bdc file in temporary web server
  build <file.bdc>     Compile .bdc file into dist/index.html
  welcome              Launch interactive Welcome & Thanks for Installing site
  version, -v          Show Bedrock Canary version info
  help                 Show this help message

Examples:
  bdc run examples/hello.bdc
  bdc build examples/todo_app.bdc
  bdc welcome
`);
}

function runFile(filePath) {
  if (!filePath) {
    console.error('Error: Please specify a .bdc file to run.');
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: File not found '${filePath}'`);
    process.exit(1);
  }

  const code = fs.readFileSync(fullPath, 'utf8');
  const { html } = transpileBDC(code);

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  const PORT = process.env.PORT || 3300;
  server.listen(PORT, () => {
    console.log(ASCII_LOGO);
    console.log(`🚀 Bedrock Canary app is running live at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server.`);
  });
}

function buildFile(filePath) {
  if (!filePath) {
    console.error('Error: Please specify a .bdc file to build.');
    process.exit(1);
  }

  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: File not found '${filePath}'`);
    process.exit(1);
  }

  const code = fs.readFileSync(fullPath, 'utf8');
  const { html } = transpileBDC(code);

  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const outputPath = path.join(distDir, 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(ASCII_LOGO);
  console.log(`✅ Build successful! Compiled output saved to: ${outputPath}`);
}

function launchWelcome() {
  const welcomeDir = path.resolve(__dirname, '../welcome');
  if (!fs.existsSync(welcomeDir)) {
    console.error('Welcome app folder not found.');
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    let reqUrl = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.join(welcomeDir, reqUrl);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      let contentType = 'text/html';
      if (ext === '.css') contentType = 'text/css';
      if (ext === '.js') contentType = 'application/javascript';
      if (ext === '.json') contentType = 'application/json';
      if (ext === '.bdc') contentType = 'text/plain';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(ASCII_LOGO);
    console.log(`🎉 Welcome to Bedrock Canary! Launching interactive onboarding: http://localhost:${PORT}`);
  });
}

switch (command) {
  case 'run':
    runFile(args[1]);
    break;
  case 'build':
    buildFile(args[1]);
    break;
  case 'welcome':
    launchWelcome();
    break;
  case 'version':
  case '-v':
  case '--version':
    console.log(ASCII_LOGO);
    console.log('Bedrock Canary version: 0.1.0-beta');
    break;
  case 'help':
  case '-h':
  case '--help':
    showHelp();
    break;
  default:
    if (command.endsWith('.bdc')) {
      runFile(command);
    } else {
      showHelp();
    }
    break;
}
