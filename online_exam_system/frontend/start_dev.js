const { spawn } = require('child_process');
const path = require('path');

const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite.cmd');
const child = spawn(vitePath, ['--host', '0.0.0.0', '--port', '5173'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
});
