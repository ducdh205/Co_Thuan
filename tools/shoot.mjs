// Chụp màn hình bằng Chrome headless:
// node tools/shoot.mjs "<query>" <WxH> <out.png> [waitMs=6000]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { startServer } from './serve.mjs';

const [query = '', size = '1280x720', out = 'shots/shot.png', waitArg] = process.argv.slice(2);
const waitMs = Number(waitArg) || 6000;
const [w, h] = size.split('x').map(Number);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const server = await startServer(0);
const port = server.address().port;
const outPath = resolve(out);
mkdirSync(dirname(outPath), { recursive: true });
const url = `http://localhost:${port}/index.html${query}`;
const args = [
  '--headless=new', '--hide-scrollbars', '--mute-audio', '--no-first-run',
  '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist',
  `--user-data-dir=${mkdtempSync(resolve(tmpdir(), 'shoot-'))}`,
  `--window-size=${w},${h}`, `--virtual-time-budget=${waitMs}`,
  '--enable-logging=stderr', '--v=0',
  `--screenshot=${outPath}`, url,
];
const proc = spawn(CHROME, args, { stdio: ['ignore', 'pipe', 'pipe'] });
let log = '';
proc.stdout.on('data', (d) => (log += d));
proc.stderr.on('data', (d) => (log += d));
const timer = setTimeout(() => proc.kill(), waitMs + 60000);
proc.on('close', () => {
  clearTimeout(timer);
  server.close();
  const lines = log.split(/\r?\n/).filter((l) => /CONSOLE|Uncaught|SyntaxError|TypeError|ReferenceError/.test(l));
  lines.forEach((l) => console.log(l.replace(/^.*?CONSOLE/, 'CONSOLE').slice(0, 300)));
  console.log(`shot: ${out} (${size}) ${url.replace(/:\d+\//, ':PORT/')}`);
});
