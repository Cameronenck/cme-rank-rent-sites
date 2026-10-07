// Shared R&R lead handler — emails cameron@cmeholdings.co via SendGrid, and
// (when TO_SLACK_TOKEN is set, e.g. sellmidwesthome) also posts to Slack.
// Zero npm dependencies (uses global fetch + URLSearchParams, Node 18+).
// Deployed to ohiohvacpros.com and sellmidwesthome.com.
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

  const site = data.site || data.siteName || data['form-name'] || 'R&R site';
  const name = data.name || '';
  const phone = data.phone || '';
  const email = data.email || '';
  const city = data.city || '';
  const address = data.address || '';
  const state = data.state || '';
  const service = data.service || data.service_needed || data.event_type || data.situation || '';
  const notes = data.notes || data.message || data.description || data.details || data.timeline || '';

  // build extra-field dump for anything not explicitly handled
  const handled = new Set(['site','siteName','form-name','name','phone','email','city','address','state','service','service_needed','event_type','situation','notes','message','description','details','timeline','source','bot-field']);
  const extra = Object.keys(data).filter(k => !handled.has(k) && data[k]).map(k => `${k}: ${data[k]}`).join('\n');

  const results = {};

  // 1. Email via SendGrid
  const sgKey = process.env.SENDGRID_API_KEY;
  const sgFrom = process.env.SENDGRID_FROM || 'cameron@truoffer.co';
  if (sgKey) {
    const subject = `New ${site} lead${service ? ' — ' + service : ''}`;
    const body = [
      `New lead from ${site}`,
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      city ? `City: ${city}` : null,
      address ? `Address: ${address}` : null,
      state ? `State: ${state}` : null,
      service ? `Service: ${service}` : null,
      notes ? `Notes: ${notes}` : null,
      extra ? `\nOther fields:\n${extra}` : null,
    ].filter(x => x !== null).join('\n');

    const msg = {
      personalizations: [{ to: [{ email: 'cameron@cmeholdings.co' }], subject }],
      from: { email: sgFrom },
      content: [{ type: 'text/plain', value: body }],
    };
    try {
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + sgKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      results.email = 'status ' + r.status;
    } catch (err) {
      results.email = 'error: ' + err.message;
    }
  } else {
    results.email = 'no SENDGRID_API_KEY';
  }

  // 2. Slack (only if token configured)
  const slackToken = process.env.TO_SLACK_TOKEN;
  if (slackToken) {
    const channel = process.env.SLACK_LEAD_CHANNEL || 'C0B2JA21Y30';
    const text = [
      `:house: *New Lead — ${site}*`,
      `• *Name:* ${name}`,
      `• *Phone:* ${phone}`,
      email ? `• *Email:* ${email}` : null,
      city ? `• *City:* ${city}` : null,
      address ? `• *Address:* ${address}` : null,
      state ? `• *State:* ${state}` : null,
      service ? `• *Service:* ${service}` : null,
      notes ? `• *Notes:* ${notes}` : null,
    ].filter(Boolean).join('\n');
    try {
      const r = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Authorization': `Bearer ${slackToken}` },
        body: JSON.stringify({ channel, text }),
      });
      const j = await r.json();
      results.slack = j.ok ? 'ok' : 'error: ' + (j.error || 'unknown');
    } catch (err) {
      results.slack = 'error: ' + err.message;
    }
  } else {
    results.slack = 'skipped (no token)';
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, results }) };
};
