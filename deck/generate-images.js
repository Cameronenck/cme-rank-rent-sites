const https = require('https');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync('/Users/bert-aiagent/.hermes/openclaw-data/credentials/.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
});

const REPLICATE_TOKEN = env.REPLICATE_API_KEY;
const OUTPUT_DIR = '/Users/bert-aiagent/apollo-workspace/cme-rank-rent-sites/deck/images';

function fetchJSON(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const urlObj = new URL(url);
    const req = https.get({ hostname: urlObj.hostname, path: urlObj.pathname + urlObj.search, headers: {'User-Agent': 'curl/7.79.1'} }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    });
    req.on('error', (e) => { fs.unlink(dest, () => {}); reject(e); });
  });
}

async function generateImage(name, prompt) {
  console.log(`🎨 Starting: ${name}`);
  
  const startRes = await fetchJSON('https://api.replicate.com/v1/models/black-forest-labs/flux-pro/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'respond-async',
    },
    body: JSON.stringify({
      input: {
        prompt: prompt,
        width: 1024,
        height: 768,
        output_format: 'webp',
        output_quality: 80,
        safety_tolerance: 2
      }
    })
  });

  if (startRes.status !== 201 && startRes.status !== 200) {
    throw new Error(`Start failed: ${startRes.status} — ${JSON.stringify(startRes.body)}`);
  }

  const predictionId = startRes.body.id;
  const pollUrl = `https://api.replicate.com/v1/predictions/${predictionId}`;
  
  let attempts = 0;
  while (attempts < 60) {
    await new Promise(r => setTimeout(r, 3000));
    const poll = await fetchJSON(pollUrl, {
      headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` }
    });
    const status = poll.body.status;
    if (status === 'succeeded') {
      const output = poll.body.output;
      const imageUrl = Array.isArray(output) ? output[0] : output;
      console.log(`  ✅ ${name}: ${imageUrl}`);
      return imageUrl;
    } else if (status === 'failed' || status === 'canceled') {
      throw new Error(`Prediction ${status}: ${JSON.stringify(poll.body.error)}`);
    }
    attempts++;
  }
  throw new Error(`Timeout after 180s for ${name}`);
}

const IMAGES = [
  {
    name: 'hero',
    file: 'deck-builder-peoria-il.webp',
    prompt: 'Professional finished wood deck on a suburban home in central Illinois, warm summer afternoon lighting, green backyard lawn, outdoor furniture on deck, two-story house in background, photorealistic, no text, no watermarks, high quality DSLR photography, natural colors'
  },
  {
    name: 'new-construction',
    file: 'new-deck-construction-peoria-il.webp',
    prompt: 'Construction crew building a new wood deck frame on a residential backyard, pressure treated lumber, professional tools visible, workers in safety gear, concrete footings visible, blue sky background, photorealistic job site photography, no text, no watermarks'
  },
  {
    name: 'deck-repair',
    file: 'deck-repair-peoria-il.webp',
    prompt: 'Close-up of a carpenter replacing old weathered deck boards with new pressure treated wood, hammer and pry bar visible, wood planks being installed, residential backyard setting, natural lighting, photorealistic, no text, no watermarks'
  },
  {
    name: 'composite',
    file: 'composite-decks-peoria-il.webp',
    prompt: 'Beautiful finished composite deck with outdoor furniture and potted plants, Trex-style composite decking boards in gray tone, clean modern look on suburban home backyard, summer afternoon lighting, photorealistic, no text, no watermarks, high quality'
  },
  {
    name: 'staining',
    file: 'deck-staining-sealing-peoria-il.webp',
    prompt: 'Homeowner applying wood stain to deck boards with a paint roller, semi-transparent brown stain being applied, deck boards visible, sunny day, residential backyard, photorealistic, no text, no watermarks, natural lighting'
  },
  {
    name: 'estimate',
    file: 'free-deck-estimate-peoria-il.webp',
    prompt: 'Friendly contractor with clipboard talking to homeowner couple in backyard, pointing at existing deck area, professional work shirt, sunny day, suburban home background, photorealistic, no text, no watermarks, natural friendly interaction'
  },
  {
    name: 'gallery-raised',
    file: 'raised-deck-peoria-il.webp',
    prompt: 'Elevated raised wood deck on two-story suburban home in Illinois, pressure treated lumber with railing, stairs going down to grass yard, late afternoon golden hour lighting, photorealistic, no text, no watermarks'
  },
  {
    name: 'gallery-ground',
    file: 'ground-level-deck-peoria-il.webp',
    prompt: 'Beautiful ground level wood patio deck in residential backyard, outdoor dining set with umbrella, surrounded by landscaping, summer evening, photorealistic, no text, no watermarks, warm lighting'
  },
  {
    name: 'gallery-wraparound',
    file: 'wraparound-deck-peoria-il.webp',
    prompt: 'Wraparound wood deck on a classic American home, wrapping around front and side of house, white railing, potted flowers, green lawn, photorealistic, no text, no watermarks, bright sunny day'
  },
  {
    name: 'gallery-multilevel',
    file: 'multi-level-deck-peoria-il.webp',
    prompt: 'Multi-level wood deck with upper and lower tiers, stairs connecting levels, outdoor furniture on upper deck, fire pit area on lower level, residential suburban backyard, photorealistic, no text, no watermarks, natural lighting'
  }
];

async function main() {
  const results = {};
  
  // Fire all in parallel
  const promises = IMAGES.map(async (img) => {
    try {
      const url = await generateImage(img.name, img.prompt);
      const dest = path.join(OUTPUT_DIR, img.file);
      console.log(`  ⬇️  Downloading ${img.name}...`);
      await downloadFile(url, dest);
      const stat = fs.statSync(dest);
      results[img.name] = { file: img.file, url, size: stat.size, ok: true };
      console.log(`  💾 Saved ${img.file} (${Math.round(stat.size/1024)}KB)`);
    } catch (e) {
      results[img.name] = { file: img.file, error: e.message, ok: false };
      console.error(`  ❌ ${img.name}: ${e.message}`);
    }
  });
  
  await Promise.all(promises);
  
  console.log('\n=== RESULTS ===');
  Object.entries(results).forEach(([k, v]) => {
    if (v.ok) console.log(`✅ ${k}: ${v.file} (${Math.round(v.size/1024)}KB)`);
    else console.log(`❌ ${k}: ${v.error}`);
  });
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'image-manifest.json'), JSON.stringify(results, null, 2));
  console.log('\nManifest saved to image-manifest.json');
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
