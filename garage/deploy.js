#!/usr/bin/env node
/**
 * SHA-based Files API deployer for garagefixlancaster.com
 * Uses Netlify Files API — no netlify CLI required
 * Site ID: b37d5386-58c2-47d2-910f-877a793ad4d9
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const SITE_ID = 'b37d5386-58c2-47d2-910f-877a793ad4d9';
const TOKEN = process.env.NETLIFY_TOKEN;
const BASE_DIR = path.resolve(__dirname);

if (!TOKEN) { console.error('NETLIFY_TOKEN not set'); process.exit(1); }

function sha1(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

function httpsRequest(method, hostname, path_, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ method, hostname, path: path_, headers }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        resolve({ status: res.statusCode, body: text });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function walkDir(dir, base) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = '/' + path.relative(base, full);
    if (e.isDirectory()) {
      files = files.concat(walkDir(full, base));
    } else {
      files.push({ full, rel });
    }
  }
  return files;
}

async function deploy() {
  console.log('Scanning files...');
  const allFiles = walkDir(BASE_DIR, BASE_DIR);
  
  // Exclude node_modules, .git, deploy scripts, temp files
  const files = allFiles.filter(f => 
    !f.rel.includes('node_modules') &&
    !f.rel.includes('.git') &&
    !f.rel.match(/\.(py|js\.map)$/) &&
    f.rel !== '/deploy.js'
  );

  console.log(`Found ${files.length} files`);

  // Pre-deploy title check
  const indexFile = files.find(f => f.rel === '/index.html');
  if (indexFile) {
    const content = fs.readFileSync(indexFile.full, 'utf8');
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1];
      console.log(`Title: "${title}"`);
      if (!title.toLowerCase().includes('garage')) {
        console.error('FAIL: Title must contain "Garage"');
        process.exit(1);
      }
      console.log('Title check PASSED');
    }
  }

  // Build SHA map
  const fileMap = {};
  const bufMap = {};
  for (const { full, rel } of files) {
    const buf = fs.readFileSync(full);
    const hash = sha1(buf);
    fileMap[rel] = hash;
    bufMap[rel] = buf;
  }

  // Create deploy
  console.log('Creating deploy...');
  const deployPayload = JSON.stringify({ files: fileMap, async: false });
  const deployResp = await httpsRequest(
    'POST',
    'api.netlify.com',
    `/api/v1/sites/${SITE_ID}/deploys`,
    {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(deployPayload)
    },
    deployPayload
  );

  if (deployResp.status !== 200) {
    console.error('Deploy create failed:', deployResp.status, deployResp.body.slice(0, 500));
    process.exit(1);
  }

  const deploy = JSON.parse(deployResp.body);
  const deployId = deploy.id;
  console.log(`Deploy ID: ${deployId}`);
  console.log(`Required files: ${deploy.required ? deploy.required.length : 0}`);

  // Upload required files
  const required = deploy.required || [];
  const hashToRel = {};
  for (const [rel, hash] of Object.entries(fileMap)) {
    hashToRel[hash] = rel;
  }

  let uploaded = 0;
  for (const hash of required) {
    const rel = hashToRel[hash];
    if (!rel) { console.log(`  Skip unknown hash: ${hash}`); continue; }
    
    const buf = bufMap[rel];
    const ext = path.extname(rel).toLowerCase();
    const contentTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.txt': 'text/plain',
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon',
      '.svg': 'image/svg+xml',
    };
    const ct = contentTypes[ext] || 'application/octet-stream';
    
    const uploadResp = await httpsRequest(
      'PUT',
      'api.netlify.com',
      `/api/v1/deploys/${deployId}/files${rel}`,
      {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': ct,
        'Content-Length': buf.length
      },
      buf
    );
    
    if (uploadResp.status >= 400) {
      console.error(`  FAIL upload ${rel}: ${uploadResp.status}`);
    } else {
      uploaded++;
      process.stdout.write(`  Uploaded (${uploaded}/${required.length}): ${rel}\n`);
    }
  }

  console.log(`\nAll files uploaded. Waiting for deploy to finalize...`);
  
  // Poll for ready
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 4000));
    const statusResp = await httpsRequest(
      'GET',
      'api.netlify.com',
      `/api/v1/deploys/${deployId}`,
      { 'Authorization': `Bearer ${TOKEN}` }
    );
    const statusData = JSON.parse(statusResp.body);
    const st = statusData.state;
    console.log(`  Deploy state: ${st}`);
    if (st === 'ready') {
      console.log(`\nDEPLOY READY`);
      console.log(`URL: ${statusData.ssl_url || statusData.url}`);
      console.log(`Deploy ID: ${deployId}`);
      return;
    }
    if (st === 'error') {
      console.error('Deploy error:', statusData.error_message);
      process.exit(1);
    }
  }
  console.error('Deploy timed out after 3 minutes');
  process.exit(1);
}

deploy().catch(e => { console.error(e); process.exit(1); });
