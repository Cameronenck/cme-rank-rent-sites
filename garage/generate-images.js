const https = require('https');
const fs = require('fs');
const path = require('path');

const REPLICATE_KEY = process.env.REPLICATE_KEY;
const OUT_DIR = path.join(__dirname, 'images');

const images = [
  { name: 'hero-garage-door-lancaster-pa', prompt: 'Photorealistic exterior of a residential home in Lancaster Pennsylvania suburb, beautiful white raised panel garage door on a brick colonial house, lush green lawn, blue sky, warm afternoon sunlight, no text, no watermarks, professional real estate photo' },
  { name: 'garage-door-repair-lancaster-pa', prompt: 'Photorealistic close-up of a garage door repair technician in work clothes examining a broken garage door spring on a residential home, tool belt visible, residential backyard setting Lancaster Pennsylvania, natural daylight, no text, no watermarks' },
  { name: 'garage-door-spring-replacement', prompt: 'Photorealistic garage door torsion spring replacement in progress, mechanic hands working on metal spring above garage door in residential garage, wrenches and tools visible on concrete floor, natural interior lighting, no text, no watermarks' },
  { name: 'garage-door-opener-installation', prompt: 'Photorealistic technician installing a modern smart garage door opener on ceiling of residential garage, suburban home setting, clean organized garage interior, neutral tones, natural lighting, no text, no watermarks' },
  { name: 'new-garage-doors-lancaster-pa', prompt: 'Photorealistic beautiful new carriage house style garage doors on a suburban home in Lancaster County Pennsylvania, white with black hardware, brick facade, well manicured landscaping, warm golden hour lighting, no text, no watermarks' },
  { name: 'emergency-garage-door-service', prompt: 'Photorealistic service truck parked in driveway of residential home at dusk, garage door service company van, technician walking toward house with toolbox, Lancaster Pennsylvania suburb neighborhood, no text, no watermarks' },
  { name: 'gallery-raised-panel-garage', prompt: 'Photorealistic two-car raised panel white garage door on traditional colonial style home in Pennsylvania suburb, concrete driveway, green lawn, blue sky, professional photo quality, no text, no watermarks' },
  { name: 'gallery-wood-garage-door', prompt: 'Photorealistic rustic wood grain garage door on craftsman bungalow home in Lancaster Pennsylvania neighborhood, warm sunset lighting, autumn trees visible, high end curb appeal, no text, no watermarks' },
  { name: 'gallery-modern-garage-door', prompt: 'Photorealistic modern black aluminum and glass garage door on contemporary home exterior, clean lines, minimal landscaping, daylight, professional architectural photography style, residential Lancaster PA suburb, no text, no watermarks' },
  { name: 'contractor-homeowner-estimate', prompt: 'Photorealistic friendly garage door contractor in polo shirt and khakis holding tablet talking with homeowner couple in residential driveway, suburban neighborhood Lancaster Pennsylvania, bright daylight, professional service call, no text, no watermarks' },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function callReplicate(prompt) {
  const body = JSON.stringify({
    input: { prompt, aspect_ratio: '4:3', output_format: 'webp', output_quality: 80 }
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.replicate.com',
      path: '/v1/models/black-forest-labs/flux-pro/predictions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=30'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function pollPrediction(id) {
  for (let i = 0; i < 36; i++) {
    await sleep(5000);
    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.replicate.com',
        path: `/v1/predictions/${id}`,
        headers: { 'Authorization': `Bearer ${REPLICATE_KEY}` }
      }, res => {
        let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
      });
      req.on('error', reject); req.end();
    });
    if (result.status === 'succeeded') {
      // output can be string or array
      return Array.isArray(result.output) ? result.output[0] : result.output;
    }
    if (result.status === 'failed') throw new Error(`Failed: ${result.error}`);
  }
  throw new Error('Timeout after 180s');
}

async function downloadWebp(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, res => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        file.close();
        return downloadWebp(res.headers.location, filepath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

(async () => {
  for (const img of images) {
    const outPath = path.join(OUT_DIR, `${img.name}.webp`);
    if (fs.existsSync(outPath)) { console.log(`SKIP ${img.name} (exists)`); continue; }
    console.log(`Generating: ${img.name}...`);
    try {
      let pred = await callReplicate(img.prompt);
      let url;
      if (pred.status === 'succeeded') {
        url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
      } else if (pred.id) {
        url = await pollPrediction(pred.id);
      } else {
        throw new Error(JSON.stringify(pred).slice(0, 200));
      }
      if (!url || !url.startsWith('http')) throw new Error(`Bad URL: ${url}`);
      await downloadWebp(url, outPath);
      const size = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`  OK: ${img.name}.webp (${size}KB)`);
    } catch(e) {
      console.log(`  ERROR: ${img.name}: ${e.message}`);
    }
    await sleep(12000);
  }
  console.log('Done.');
})();
