import { spawn } from 'node:child_process';
import path from 'node:path';

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
  cwd: path.resolve(process.cwd()),
  detached: true,
  stdio: 'ignore',
  windowsHide: true,
  shell: true,
});
child.unref();
console.log('spawned', child.pid);
