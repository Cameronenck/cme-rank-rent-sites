// sellmidwesthome.com — Slack lead notifier (TruOffer #website-form-leads).
// Email is handled natively by Netlify Forms (dashboard notification to
// cameron@cmeholdings.co). This function ONLY posts to Slack.
// Zero npm dependencies (global fetch, Node 18+).
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' };

  let data = {};
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    const sp = new URLSearchParams(event.body || '');
    for (const [k, v] of sp) data[k] = v;
  }

  const site = data.site || data.siteName || data['form-name'] || 'SellMidwestHome.com';
  const name = data.name || '';
  const phone = data.phone || '';
  const email = data.email || '';
  const address = data.address || '';
  const city = data.city || '';
  const state = data.state || '';
  const situation = data.situation || '';
  const timeline = data.timeline || '';
  const source = data.source || '';

  const token = process.env.TO_SLACK_TOKEN;
  if (!token) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, slack: 'no token' }) };
  }
  const channel = process.env.SLACK_LEAD_CHANNEL || 'C0B2JA21Y30';

  const text = [
    `:house: *New Lead — ${site}*`,
    `• *Name:* ${name}`,
    `• *Phone:* ${phone}`,
    email ? `• *Email:* ${email}` : null,
    address ? `• *Address:* ${address}` : null,
    city ? `• *City:* ${city}` : null,
    state ? `• *State:* ${state}` : null,
    situation ? `• *Situation:* ${situation}` : null,
    timeline ? `• *Timeline:* ${timeline}` : null,
    source ? `• *Source:* ${source}` : null,
  ].filter(Boolean).join('\n');

  let slack;
  try {
    const r = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ channel, text }),
    });
    const j = await r.json();
    slack = j.ok ? 'ok' : 'error: ' + (j.error || 'unknown');
  } catch (err) {
    slack = 'error: ' + err.message;
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, slack }) };
};
