// Chụp màn hình bằng Chrome headless qua DevTools Protocol (giả lập đúng kích thước thiết bị):
// node tools/shoot.mjs "<query>" <WxH> <out.png> [waitMs=6000]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { startServer } from './serve.mjs';

const [query = '', size = '1280x720', out = 'shots/shot.png', waitArg] = process.argv.slice(2);
const waitMs = Number(waitArg) || 6000;
const [w, h] = size.split('x').map(Number);
const mobile = w < 800;
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = await startServer(0);
const port = server.address().port;
const outPath = resolve(out);
mkdirSync(dirname(outPath), { recursive: true });
const url = `http://localhost:${port}/index.html${query}`;
const profile = mkdtempSync(join(tmpdir(), 'shoot-'));
const proc = spawn(CHROME, [
  '--headless=new', '--hide-scrollbars', '--mute-audio', '--no-first-run', '--no-default-browser-check',
  '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist',
  '--autoplay-policy=no-user-gesture-required',
  `--user-data-dir=${profile}`, '--remote-debugging-port=0', `--window-size=${Math.max(w, 800)},${Math.max(h, 600)}`,
  'about:blank',
], { stdio: 'ignore' });

const logs = [];
let ws;
try {
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100);
  const devPort = readFileSync(portFile, 'utf8').split('\n')[0].trim();
  const targets = await (await fetch(`http://127.0.0.1:${devPort}/json`)).json();
  const page = targets.find((t) => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((ok, bad) => { ws.onopen = ok; ws.onerror = bad; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
      logs.push(`console.${msg.params.type}: ${text}`);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      logs.push(`EXCEPTION: ${d.exception?.description || d.text}`);
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      logs.push(`LOG ERROR: ${msg.params.entry.text} ${msg.params.entry.url || ''}`);
    }
  };
  const send = (method, params = {}) => new Promise((ok) => { const i = ++id; pending.set(i, ok); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  await send('Page.enable');
  await send('Page.navigate', { url });
  await sleep(waitMs);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
} finally {
  try { ws && ws.close(); } catch {}
  proc.kill();
  server.close();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
}
logs.forEach((l) => console.log(l.slice(0, 400)));
console.log(`shot: ${out} (${size}) ${url.replace(/:\d+\//, ':PORT/')}`);
process.exit(0);
