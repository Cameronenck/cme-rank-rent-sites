// SellMidwestHome — Lead submission handler
// Posts to TruOffer #website-form-leads Slack channel
// Env vars required in Netlify dashboard:
//   TO_SLACK_TOKEN  = xoxb-3841220806081-...
//   SLACK_LEAD_CHANNEL = C0B2JA21Y30

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method not allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: 'Invalid JSON' };
  }

  const {
    name = '',
    phone = '',
    address = '',
    city = '',
    state = '',
    situation = '',
    timeline = '',
    source = '',
    submitted = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }),
  } = data;

  const token = process.env.TO_SLACK_TOKEN;
  const channel = process.env.SLACK_LEAD_CHANNEL || 'C0B2JA21Y30';

  const text = [
    ':house: *New Lead — SellMidwestHome.com*',
    `• *Name:* ${name}`,
    `• *Phone:* ${phone}`,
    `• *Address:* ${address}`,
    `• *City:* ${city}`,
    `• *State:* ${state}`,
    `• *Situation:* ${situation}`,
    timeline ? `• *Timeline:* ${timeline}` : null,
    `• *Source Page:* ${source}`,
    `• *Submitted:* ${submitted} CT`,
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel, text }),
    });

    const result = await res.json();
    if (!result.ok) {
      console.error('Slack error:', result.error);
    }
  } catch (err) {
    console.error('Slack post failed:', err.message);
  }

  // Always return success — Netlify Forms is the backup
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true }),
  };
};
