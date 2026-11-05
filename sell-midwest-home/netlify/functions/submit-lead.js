// sellmidwesthome.com — form lead handler (Netlify Function)
//
// 1) Post the lead to Slack (#website-form-leads) in Cam's exact format.
// 2) Push the lead into REsimpli, deduping against an existing OPEN lead
//    (phone OR address) — no full lead scans, targeted searches only.
// 3) Append "REsimpli: <link>" to the Slack post on success, or
//    "⚠️ Not in REsimpli: <reason>. Add manually." on failure.
// 4) Flag-only spam check (city/state mismatch or far area code) — never blocks.
// Zero npm dependencies (global fetch, Node 18+).
//
// Auth — two REsimpli APIs on the same host, never mixed:
//   RESIMPLI_API_KEY  (Open API,   Authorization: <hex key>)  — PRIMARY
//   RESIMPLI_JWT      (dashboard,  authorization: <raw JWT>)  — FALLBACK (only
//                     used when RESIMPLI_API_KEY is absent or its key is invalid)
//
// Env vars (Netlify dashboard):
//   TO_SLACK_TOKEN           (existing)
//   SLACK_LEAD_CHANNEL       (existing; default C0B2JA21Y30)
//   RESIMPLI_API_KEY         (NEW — REsimpli Open API hex key)
//   RESIMPLI_JWT             (NEW — REsimpli dashboard JWT, fallback only)
//   RESIMPLI_CAMPAIGN_NAME   (optional; default "Midwest | Website | SellMidwestHome")

const OPENAPI_BASE = 'https://api.resimpli.com/api/v6/openapi';
const DASHBOARD_BASE = 'https://api.resimpli.com/api/v6';
const DASHBOARD_REFERER = 'https://dashboard.resimpli.com/';

// Account IDs (shared by both APIs — same account).
const IDS = {
  LEADS_MODULE: '5faa63fdfd20cd581703d255',     // activity/save module for leads (dashboard)
  MARKET_PRIMARY: '6539f23624b7f90043123d7c',   // "Primary Market"
  PIPELINE_ACTIVE: '6aa4dd1bd18014f8fc6529c3',  // "Active Leads"
  STATUS_NEW: '6aa4dd1bd18014f8fc6529c4',       // "New Leads" (first stage)
};

const CLOSED_STATUS_TITLES = new Set(['Dead Lead', 'Sold', 'Closed']);

// Expected area codes per served state. A phone whose area code is NOT in the
// property's state list is flagged as possible spam. (flag-only, never blocks)
const STATE_AREA_CODES = {
  IL: ['217','224','309','312','331','464','618','630','708','773','815','847','872'],
  OH: ['216','220','234','326','330','380','419','440','513','567','614','740','937'],
  IN: ['219','260','317','463','574','765','812','930'],
  MI: ['231','248','269','313','517','586','616','734','810','906','947','989'],
  MO: ['314','417','557','573','636','660','816'],
  KY: ['270','364','502','606','859'],
};

// Well-known US cities -> state (uppercase 2-letter). Used only to flag a
// city/state mismatch (e.g. "El Paso" is in TX, so "El Paso, OH" is spam).
// Unknown cities are NOT flagged — light heuristic, not a gazetteer.
const CITY_STATE = {
  'akron':'OH','canton':'OH','cincinnati':'OH','cleveland':'OH','columbus':'OH',
  'cuyahoga falls':'OH','dayton':'OH','elyria':'OH','euclid':'OH','hamilton':'OH',
  'kettering':'OH','lakewood':'OH','lorain':'OH','mansfield':'OH','middletown':'OH',
  'newark':'OH','parma':'OH','springfield':'OH','toledo':'OH','youngstown':'OH',
  'aurora':'IL','berwyn':'IL','bloomington':'IL','bolingbrook':'IL','champaign':'IL',
  'chicago':'IL','cicero':'IL','danville':'IL','decatur':'IL','downers grove':'IL',
  'elgin':'IL','joliet':'IL','moline':'IL','naperville':'IL','normal':'IL',
  'palatine':'IL','peoria':'IL','rockford':'IL','schaumburg':'IL','waukegan':'IL',
  'wheaton':'IL',
  'anderson':'IN','carmel':'IN','evansville':'IN','fishers':'IN','fort wayne':'IN',
  'gary':'IN','greenwood':'IN','hammond':'IN','indianapolis':'IN','kokomo':'IN',
  'lafayette':'IN','muncie':'IN','noblesville':'IN','south bend':'IN','terre haute':'IN',
  'ann arbor':'MI','dearborn':'MI','detroit':'MI','farmington hills':'MI','flint':'MI',
  'grand rapids':'MI','kalamazoo':'MI','lansing':'MI','livonia':'MI',
  'rochester hills':'MI','southfield':'MI','sterling heights':'MI','troy':'MI',
  'warren':'MI','westland':'MI','wyoming':'MI',
  'blue springs':'MO','columbia':'MO','independence':'MO','kansas city':'MO',
  "lee's summit":'MO',"o'fallon":'MO','st. charles':'MO','st. joseph':'MO',
  'st. louis':'MO','st. peters':'MO',
  'bowling green':'KY','covington':'KY','florence':'KY','georgetown':'KY',
  'henderson':'KY','hopkinsville':'KY','lexington':'KY','louisville':'KY',
  'owensboro':'KY','richmond':'KY',
  'el paso':'TX','los angeles':'CA','san francisco':'CA','san diego':'CA','sacramento':'CA',
  'new york':'NY','brooklyn':'NY','buffalo':'NY','rochester':'NY','syracuse':'NY',
  'miami':'FL','tampa':'FL','orlando':'FL','jacksonville':'FL',
  'houston':'TX','dallas':'TX','austin':'TX','san antonio':'TX','fort worth':'TX',
  'phoenix':'AZ','denver':'CO','seattle':'WA','portland':'OR','atlanta':'GA',
  'boston':'MA','philadelphia':'PA','pittsburgh':'PA','baltimore':'MD','nashville':'TN',
  'memphis':'TN','charlotte':'NC','raleigh':'NC','minneapolis':'MN','milwaukee':'WI',
  'las vegas':'NV','salt lake city':'UT','oklahoma city':'OK','tulsa':'OK',
  'omaha':'NE','des moines':'IA','wichita':'KS','boise':'ID','albuquerque':'NM',
};

// ---- small helpers ---------------------------------------------------------

const digits = (raw) => String(raw || '').replace(/\D/g, '');
const last10 = (raw) => digits(raw).slice(-10);

function toE164(raw) {
  const d = digits(raw);
  if (!d) return null;
  if (d.length === 10) return '+1' + d;
  if (d.length === 11 && d[0] === '1') return '+' + d;
  return '+' + d;
}

// Normalize an address to its street portion (lowercase, punctuation stripped).
function normStreet(s) {
  return String(s || '')
    .split(',')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function formatSubmitted() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).formatToParts(new Date());
  const get = (t) => (parts.find((p) => p.type === t) || {}).value || '';
  const date = `${get('month')} ${get('day')}, ${get('year')}`;
  const time = `${get('hour')}:${get('minute')} ${get('dayPeriod')}`.toUpperCase();
  return `${date} at ${time} CT`;
}

// Flag-only spam check. Returns a message string or null. Never blocks/drops.
function spamCheck({ city, state, phone }) {
  const reasons = [];
  const st = String(state || '').trim().toUpperCase();
  const cty = String(city || '').trim().toLowerCase();

  if (cty && st) {
    const knownState = CITY_STATE[cty];
    if (knownState && knownState !== st) reasons.push(`city "${city}" is not in ${st}`);
  }
  const area = last10(phone).slice(0, 3);
  const expected = STATE_AREA_CODES[st];
  if (area && expected && !expected.includes(area)) reasons.push(`area code ${area} is not a ${st} area code`);

  return reasons.length ? `⚠️ Check: possible spam (${reasons.join('; ')})` : null;
}

// Market mapping. Site is multi-state (6 Midwest states); REsimpli has NO
// "Midwest" market, so every lead files under "Primary Market" (same catch-all
// as "All Markets | JV"). Alt: OH -> "Columbus, OH", MO -> "St.Louis, MO".
function marketIdFor(_state) {
  return IDS.MARKET_PRIMARY;
}

// ---- REsimpli clients ------------------------------------------------------

async function openApi(path, body, apiKey) {
  const r = await fetch(`${OPENAPI_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify(body),
  });
  let j; try { j = await r.json(); } catch { j = { statusCode: r.status, message: 'non-json' }; }
  return j;
}

async function dashboard(path, body, jwt) {
  const r = await fetch(`${DASHBOARD_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: jwt, Referer: DASHBOARD_REFERER },
    body: JSON.stringify(body),
  });
  let j; try { j = await r.json(); } catch { j = { statusCode: r.status, message: 'non-json' }; }
  return j;
}

// Find campaign by exact name -> _id or null.
async function findCampaignByName(name, { apiKey, jwt }) {
  if (apiKey) {
    const r = await openApi('marketingCampaignList', { campaignType: 1 }, apiKey);
    const items = (r && (r.data && (r.data.items || r.data))) || [];
    for (const c of items) if (c.name === name) return c._id;
    return null;
  }
  let page = 1;
  while (true) {
    const r = await dashboard('marketingCampaign/list', { page, limit: 100 }, jwt);
    const items = (r && r.data && r.data.items) || [];
    if (!items.length) break;
    for (const c of items) if (c.name === name && !c.isDeleted) return c._id;
    if (items.length < 100) break;
    page++;
  }
  return null;
}

// Open lead? Unknown status treated as OPEN (safer to note than duplicate).
function isOpenLead(lead) {
  const t = String(lead && (lead.mainStatusTitle || lead.mainStatusName || lead.status) || '');
  if (!t) return true;
  return !CLOSED_STATUS_TITLES.has(t);
}

function leadPhones(lead) {
  const out = [];
  const cds = lead && (lead.contactData || lead.contactDetails || lead.contacts || []);
  for (const c of (cds || [])) {
    for (const p of (c.phoneNumbers || [])) {
      const n = last10(p.phoneNumber || p.number || p);
      if (n) out.push(n);
    }
  }
  return out;
}

// Targeted de-dupe (NO full scans).
// Open API: lead/list {searchStr} — search by address street and by phone.
// Dashboard: contact/search by phone (fast). Returns { leadId } or null.
async function findExistingOpenLead({ streetNorm, phoneDigits, apiKey, jwt }) {
  if (apiKey) {
    for (const q of [streetNorm, phoneDigits]) {
      if (!q) continue;
      const r = await openApi('lead/list', { searchStr: q, page: 1, limit: 100 }, apiKey);
      const items = (r && r.data && (r.data.items || r.data)) || [];
      for (const lead of items) {
        if (!isOpenLead(lead)) continue;
        if (streetNorm && normStreet(lead.address) === streetNorm) return { leadId: lead._id };
        if (phoneDigits && leadPhones(lead).includes(phoneDigits)) return { leadId: lead._id };
      }
    }
    return null;
  }

  // Dashboard fallback: phone only (contact/search is the fast targeted path).
  if (phoneDigits) {
    const r = await dashboard('contact/search', { searchString: phoneDigits }, jwt);
    const items = (r && r.data && r.data.items) || [];
    for (const c of items) {
      const phones = (c.phoneNumbers || []).map((p) => last10(p.phoneNumber));
      if (phones.includes(phoneDigits)) return { contactExists: true, contactId: c._id };
    }
  }
  return null;
}

function buildNote({ situation, timeline, email, source, submitted }) {
  return [
    'Source: SellMidwestHome.com website form',
    situation ? `Situation: ${situation}` : null,
    timeline ? `Timeline: ${timeline}` : null,
    email ? `Email: ${email}` : null,
    source ? `Source Page: ${source}` : null,
    `Submitted: ${submitted}`,
  ].filter(Boolean).join('\n');
}

// Push the lead. Returns { leadId, existing } or { error }.
async function pushLead(fields, { apiKey, jwt }) {
  const { name, phone, address, city, state, situation, timeline, email, source, submitted, campaignId } = fields;
  const phoneDigits = last10(phone);
  const e164 = toE164(phone);
  const streetNorm = normStreet(address);

  if (!phoneDigits || phoneDigits.length < 10) {
    return { error: 'no valid phone (lead requires a phone)' };
  }

  const existing = await findExistingOpenLead({ streetNorm, phoneDigits, apiKey, jwt });
  const note = buildNote({ situation, timeline, email, source, submitted });

  // Existing OPEN lead -> add a note (don't duplicate).
  if (existing && existing.leadId) {
    const addNote = apiKey
      ? await openApi('activity/add', { moduleId: 1, subModuleId: existing.leadId, comment: note }, apiKey)
      : await dashboard('activity/save', { moduleId: IDS.LEADS_MODULE, subModuleId: existing.leadId, comment: note, activityType: 8 }, jwt);
    const ok = addNote && (addNote.statusCode === 200 || addNote.statusCode === 201 || addNote.status === 200);
    return ok ? { leadId: existing.leadId, existing: true } : { error: `note on existing lead failed: ${(addNote && addNote.message) || 'unknown'}`, leadId: existing.leadId };
  }

  // New lead.
  if (apiKey) {
    const contactDetails = {
      firstName: (name || 'Seller').trim().split(/\s+/)[0] || 'Seller',
      lastName: (name || 'Seller').trim().split(/\s+/).slice(1).join(' '),
      phoneNumbers: [{ phoneNumber: phoneDigits, isPrimary: true }],
    };
    if (email) contactDetails.emails = [{ email, isPrimary: true }];

    const fullAddress = [address, city, state].filter(Boolean).join(', ');
    const l = await openApi('lead/add', {
      contactDetails,
      propertyType: 'residential',
      address: fullAddress,
      marketingCampignId: campaignId,
      marketId: marketIdFor(state),
      pipelineId: IDS.PIPELINE_ACTIVE,
      mainStatusId: IDS.STATUS_NEW,
      leadCreated: new Date().toISOString(),
      comment: note,
    }, apiKey);
    const leadId = (l && l.data && (l.data._id || l.data.leadId || l.data.id)) || (l && l.leadId);
    if (!leadId) return { error: `lead/add failed: ${(l && l.message) || 'unknown'}` };
    // Also write the note explicitly (comment on lead/add may not persist as a note).
    await openApi('activity/add', { moduleId: 1, subModuleId: leadId, comment: note }, apiKey);
    return { leadId, existing: false };
  }

  // Dashboard fallback: contact find-or-create -> lead/save -> activity/save.
  let contactId = (existing && existing.contactId) || null;
  if (!contactId) {
    const s = await dashboard('contact/search', { searchString: phoneDigits }, jwt);
    const items = (s && s.data && s.data.items) || [];
    for (const c of items) {
      const phones = (c.phoneNumbers || []).map((p) => last10(p.phoneNumber));
      if (phones.includes(phoneDigits)) { contactId = c._id; break; }
    }
  }
  if (!contactId) {
    const [first, ...rest] = (name || 'Seller').trim().split(/\s+/);
    const body = {
      firstName: first || 'Seller',
      lastName: rest.join(' '),
      phoneNumbers: [{ phoneNumber: e164, isPrimary: true }],
    };
    if (email) body.emails = [{ email }];
    const c = await dashboard('contact/save', body, jwt);
    contactId = c && c.data && (c.data._id || c.data.contactId);
    if (!contactId) return { error: `contact/save failed: ${(c && c.message) || 'unknown'}` };
  }

  const fullAddress = [address, city, state].filter(Boolean).join(', ');
  const l = await dashboard('lead/save', {
    propertyType: 'residential',
    marketingCampignId: campaignId,
    marketId: marketIdFor(state),
    pipelineId: IDS.PIPELINE_ACTIVE,
    mainStatusId: IDS.STATUS_NEW,
    leadCreated: Date.now(),
    isContactExists: true,
    contactInfo: [{ contactId, isPrimary: true }],
    address: fullAddress,
  }, jwt);
  const leadId = l && l.data && l.data._id;
  if (!leadId) return { error: `lead/save failed: ${(l && l.message) || 'unknown'}` };

  await dashboard('activity/save', { moduleId: IDS.LEADS_MODULE, subModuleId: leadId, comment: note, activityType: 8 }, jwt);
  return { leadId, existing: false };
}

// ---- Slack -----------------------------------------------------------------

async function postSlack(token, channel, text) {
  const r = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ channel, text }),
  });
  return r.json();
}
async function updateSlack(token, channel, ts, text) {
  const r = await fetch('https://slack.com/api/chat.update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ channel, ts, text }),
  });
  return r.json();
}

// ---- handler ---------------------------------------------------------------

exports.handler = async (event) => {
  const T0 = Date.now();
  const timing = {};
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
  } catch {
    for (const [k, v] of new URLSearchParams(event.body || '')) data[k] = v;
  }

  const name = String(data.name || '').trim();
  const phone = String(data.phone || '').trim();
  const email = String(data.email || '').trim();
  const address = String(data.address || '').trim();
  const city = String(data.city || '').trim();
  const state = String(data.state || '').trim();
  const situation = String(data.situation || '').trim();
  const timeline = String(data.timeline || '').trim();
  const source = String(data.source || '').trim();

  const spam = spamCheck({ city, state, phone });
  const submitted = formatSubmitted();

  const lines = [
    'New Lead — SellMidwestHome.com',
    `• Name: ${name}`,
    `• Phone: ${last10(phone)}`,
    email ? `• Email: ${email}` : null,
    `• Address: ${address}`,
    `• City: ${city}`,
    `• State: ${state}`,
    `• Situation: ${situation}`,
    timeline ? `• Timeline: ${timeline}` : null,
    `• Source Page: ${source}`,
    `• Submitted: ${submitted}`,
  ].filter((x) => x !== null);
  if (spam) lines.push(spam);
  const baseText = lines.join('\n');

  const token = process.env.TO_SLACK_TOKEN;
  const channel = process.env.SLACK_LEAD_CHANNEL || 'C0B2JA21Y30';

  let slackResult = { ok: false, error: 'no token' };
  if (token) {
    const s0 = Date.now();
    slackResult = await postSlack(token, channel, baseText);
    timing.slackPost = `${Date.now() - s0}ms`;
  }

  // REsimpli push (Open API primary, JWT fallback).
  const apiKey = (process.env.RESIMPLI_API_KEY || '').trim();
  const jwt = (process.env.RESIMPLI_JWT || '').trim();
  const campaignName = (process.env.RESIMPLI_CAMPAIGN_NAME || 'Midwest | Website | SellMidwestHome').trim();

  let resimpli = { status: 'skipped', reason: 'no RESIMPLI_API_KEY or RESIMPLI_JWT configured' };
  let authMode = null;

  if (apiKey || jwt) {
    const r0 = Date.now();
    try {
      if (apiKey) {
        const info = await openApi('getUserInfo', {}, apiKey);
        authMode = (info && (info.statusCode === 200 || info.data)) ? 'openapi' : (jwt ? 'jwt' : null);
      } else if (jwt) {
        authMode = 'jwt';
      }

      if (authMode) {
        const campaignId = await findCampaignByName(campaignName, {
          apiKey: authMode === 'openapi' ? apiKey : null,
          jwt: authMode === 'jwt' ? jwt : null,
        });

        if (!campaignId) {
          resimpli = { status: 'skipped', reason: `campaign "${campaignName}" not found (create it in REsimpli)` };
        } else {
          resimpli = await pushLead({
            name, phone, address, city, state, situation, timeline, email, source, submitted, campaignId,
          }, {
            apiKey: authMode === 'openapi' ? apiKey : null,
            jwt: authMode === 'jwt' ? jwt : null,
          });
          resimpli.auth = authMode;
        }
      } else {
        resimpli = { status: 'skipped', reason: 'RESIMPLI_API_KEY invalid and no RESIMPLI_JWT fallback' };
      }
    } catch (err) {
      resimpli = { status: 'error', reason: err.message };
    }
    timing.resimpli = `${Date.now() - r0}ms`;
  }

  // Append the outcome line to the Slack post.
  if (token && slackResult.ok) {
    const extra = resimpli.leadId
      ? `REsimpli: https://dashboard.resimpli.com/leads/details?leadsId=${resimpli.leadId}`
      : `⚠️ Not in REsimpli: ${resimpli.reason || resimpli.error || 'unknown'}. Add manually.`;
    try {
      const u0 = Date.now();
      await updateSlack(token, channel, slackResult.ts, `${baseText}\n${extra}`);
      timing.slackUpdate = `${Date.now() - u0}ms`;
    } catch {}
  }

  timing.total = `${Date.now() - T0}ms`;
  console.log(JSON.stringify({ ts: new Date().toISOString(), timing, resimpli, spam: !!spam }));

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, slack: slackResult.ok, resimpli, timing }),
  };
};
