#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envContent = fs.readFileSync('/Users/bert-aiagent/.hermes/openclaw-data/credentials/.env.local', 'utf8');
const NETLIFY_TOKEN = envContent.match(/NETLIFY_TOKEN=([^\n]+)/)?.[1]?.trim();

const SITE_ID = '93a2ad32-085d-448b-8410-af19a34c2e0d';
const SITE_DIR = '/Users/bert-aiagent/apollo-workspace/cme-rank-rent-sites/deck';

function sha1(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex');
}

function walkDir(dir, base) {
  const results = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fullPath = path.join(dir, e.name);
    if (e.isDirectory()) {
      const sub = walkDir(fullPath, base);
      Object.assign(results, sub);
    } else if (e.isFile() && !e.name.startsWith('.') && !e.name.endsWith('.js') && e.name !== 'generate-images.js' && e.name !== 'generate-images-sequential.js' && e.name !== 'deploy.js') {
      const rel = '/' + path.relative(base, fullPath);
      const buf = fs.readFileSync(fullPath);
      results[rel] = { path: fullPath, sha: sha1(buf), buf };
    }
  }
  return results;
}

function apiRequest(method, path, data, isBinary) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.netlify.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
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
  console.log('Walking site directory...');
  const files = walkDir(SITE_DIR, SITE_DIR);
  const fileList = {};
  for (const [rel, info] of Object.entries(files)) {
    fileList[rel] = info.sha;
  }
  console.log(`Found ${Object.keys(fileList).length} files`);

  console.log('Creating deploy...');
  const deployResp = await apiRequest('POST', `/api/v1/sites/${SITE_ID}/deploys`, { files: fileList });
  console.log('Deploy response status:', deployResp.status);
  if (deployResp.status !== 200) {
    console.error('Deploy creation failed:', JSON.stringify(deployResp.data));
    process.exit(1);
  }

  const deployId = deployResp.data.id;
  const required = deployResp.data.required || [];
  console.log(`Deploy ID: ${deployId}`);
  console.log(`Files required for upload: ${required.length}`);

  // Upload required files
  for (const sha of required) {
    const match = Object.entries(files).find(([, info]) => info.sha === sha);
    if (!match) {
      console.warn(`Could not find file for SHA: ${sha}`);
      continue;
    }
    const [rel, info] = match;
    console.log(`Uploading: ${rel} (${info.buf.length} bytes)`);
    const uploadResp = await apiRequest('PUT', `/api/v1/deploys/${deployId}/files${rel}`, info.buf, true);
    if (uploadResp.status !== 200) {
      console.error(`Upload failed for ${rel}:`, JSON.stringify(uploadResp.data));
    } else {
      console.log(`  -> ${uploadResp.status} OK`);
    }
  }

  // Poll for ready
  console.log('\nWaiting for deploy to go live...');
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 4000));
    const statusResp = await apiRequest('GET', `/api/v1/deploys/${deployId}`);
    const state = statusResp.data.state;
    console.log(`  State: ${state}`);
    if (state === 'ready') {
      console.log('\nDeploy is LIVE!');
      console.log('URL:', statusResp.data.deploy_url || statusResp.data.ssl_url || statusResp.data.url);
      break;
    }
    if (state === 'error') {
      console.error('Deploy error:', statusResp.data.error_message);
      break;
    }
  }
}

deploy().catch(e => { console.error(e); process.exit(1); });
