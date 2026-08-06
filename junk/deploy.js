#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const SITE_ID = '062fd7b5-2968-49fd-a39e-17ce4c28523e';
const TOKEN = process.env.NETLIFY_TOKEN;
const BASE_DIR = path.resolve(__dirname);

if (!TOKEN) { console.error('NETLIFY_TOKEN not set'); process.exit(1); }

function sha1(buf) { return crypto.createHash('sha1').update(buf).digest('hex'); }

function request(method, urlPath, data, isBinary) {
  return new Promise((resolve, reject) => {
    const body = isBinary ? data : (data ? JSON.stringify(data) : null);
    const opts = {
      hostname: 'api.netlify.com',
      path: urlPath,
      method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Type': isBinary ? 'application/octet-stream' : 'application/json',
      }
    };
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body);
    const req = https.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, body: JSON.parse(text) }); }
        catch(e) { resolve({ status: res.statusCode, body: text }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const SKIP = new Set(['.DS_Store','deploy.js','generate-images.js','.git','.gitignore','node_modules']);
const SKIP_EXT = new Set(['.js.map']);

function walkFiles(dir, rel) {
  rel = rel || '';
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = path.join(dir, entry);
    const relPath = rel ? rel + '/' + entry : '/' + entry;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) { out.push(...walkFiles(full, relPath)); }
    else if (!SKIP_EXT.has(path.extname(entry))) { out.push({ full, relPath }); }
  }
  return out;
}

async function deploy() {
  console.log('Scanning files...');
  const files = walkFiles(BASE_DIR);
  const fileMap = {};
  for (const f of files) {
    const buf = fs.readFileSync(f.full);
    fileMap[f.relPath] = { buf, sha: sha1(buf) };
  }
  
  const payload = { files: {}, async: false };
  for (const [rp, obj] of Object.entries(fileMap)) payload.files[rp] = obj.sha;
  
  console.log(`Deploying ${files.length} files to site ${SITE_ID}...`);
  const r1 = await request('POST', `/api/v1/sites/${SITE_ID}/deploys`, payload, false);
  if (r1.status !== 200) { console.error('Deploy create failed:', r1.status, JSON.stringify(r1.body)); process.exit(1); }
  
  const deployId = r1.body.id;
  const required = r1.body.required || [];
  console.log(`Deploy ID: ${deployId}, need to upload ${required.length} files`);
  
  for (const sha of required) {
    const entry = Object.entries(fileMap).find(([,o]) => o.sha === sha);
    if (!entry) { console.warn('SHA not found:', sha); continue; }
    const [rp, obj] = entry;
    const ext = path.extname(rp);
    const mimes = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.txt':'text/plain','.xml':'application/xml','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon'};
    const ct = mimes[ext] || 'application/octet-stream';
    const r2 = await request('PUT', `/api/v1/deploys/${deployId}/files${rp}`, obj.buf, true);
    console.log(`  ${r2.status === 200 ? 'OK' : 'ERR'} ${rp}`);
  }
  
  console.log('Deploy complete! ID:', deployId);
}

deploy().catch(e => { console.error(e); process.exit(1); });
