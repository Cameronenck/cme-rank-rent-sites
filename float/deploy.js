#!/usr/bin/env node
/**
 * SHA-based Files API deployer for lancasterfloatco.com
 * Uses Netlify Files API — no netlify CLI required
 * Site ID: b5a3bbb3-3ed4-4c88-aa8f-eccb92bf51a7
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const SITE_ID = 'b5a3bbb3-3ed4-4c88-aa8f-eccb92bf51a7';
const TOKEN = process.env.NETLIFY_TOKEN;
const BASE_DIR = path.resolve(__dirname);

if (!TOKEN) { console.error('NETLIFY_TOKEN not set'); process.exit(1); }

function sha1(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

function walkDir(dir, base) {
  const results = {};
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, e.name);
    if (e.isDirectory()) {
      Object.assign(results, walkDir(fullPath, base));
    } else if (e.isFile() && !e.name.startsWith('.') && !e.name.endsWith('.js') && e.name !== 'generate-images.js') {
      const rel = '/' + path.relative(base, fullPath);
      const buf = fs.readFileSync(fullPath);
      results[rel] = { path: fullPath, sha: sha1(buf), buf };
    }
  }
  return results;
}

function apiRequest(method, urlPath, data, isBinary) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.netlify.com',
      path: urlPath,
      method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': isBinary ? 'application/octet-stream' : 'application/json',
      }
    };
    if (data && !isBinary) opts.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    if (data && isBinary) opts.headers['Content-Length'] = data.length;

    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data && !isBinary) req.write(JSON.stringify(data));
    if (data && isBinary) req.write(data);
    req.end();
  });
}

async function deploy() {
  const files = walkDir(BASE_DIR, BASE_DIR);
  const fileList = {};
  for (const [rel, info] of Object.entries(files)) fileList[rel] = info.sha;

  // Title pre-check
  const idxBuf = files['/index.html']?.buf;
  if (idxBuf) {
    const m = idxBuf.toString().match(/<title>([^<]+)<\/title>/i);
    if (m) { console.log(`Title: "${m[1]}"`); } else { console.warn('No <title> found!'); }
  }

  console.log(`Scanning files... Found ${Object.keys(fileList).length} files`);

  const deployResp = await apiRequest('POST', `/api/v1/sites/${SITE_ID}/deploys`, { files: fileList });
  if (deployResp.status !== 200) {
    console.error('Deploy creation failed:', JSON.stringify(deployResp.data));
    process.exit(1);
  }
  const deployId = deployResp.data.id;
  const required = deployResp.data.required || [];
  console.log(`Deploy ID: ${deployId}\nRequired files: ${required.length}`);

  for (const sha of required) {
    const match = Object.entries(files).find(([, info]) => info.sha === sha);
    if (!match) { console.warn(`No file for SHA: ${sha}`); continue; }
    const [rel, info] = match;
    const uploadResp = await apiRequest('PUT', `/api/v1/deploys/${deployId}/files${rel}`, info.buf, true);
    console.log(`  Uploaded (${required.indexOf(sha)+1}/${required.length}): ${rel} — ${uploadResp.status}`);
  }

  console.log('\nWaiting for deploy to finalize...');
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const s = await apiRequest('GET', `/api/v1/deploys/${deployId}`);
    console.log(`  Deploy state: ${s.data.state}`);
    if (s.data.state === 'ready') {
      console.log(`\nDEPLOY READY\nURL: ${s.data.ssl_url || s.data.url}\nDeploy ID: ${deployId}`);
      break;
    }
    if (s.data.state === 'error') { console.error('Deploy error:', s.data.error_message); break; }
  }
}

deploy().catch(e => { console.error(e); process.exit(1); });
