# Peoria Water Filtration — Blog Deployment Log

Site: peoriawaterfiltration.com
Netlify Site ID: 6a34ec8d-079f-479b-8c4a-d34bc9203b06
Netlify name: pure-water-peoria
Working dir: /Users/bert-aiagent/apollo-workspace/cme-rank-rent-sites/peoria-water-filtration/
CallRail phone: 309-322-7015 → href="tel:+13093227015"
Deploy method: `node deploy.js` (Netlify API, full-directory manifest). NO git repo for this site.

## Schedule
2x/week — Wed 12pm ET + Fri 12pm ET

## Deployment history

| Date | Slug | Title | Words (article) | Sections | Status |
|------|------|-------|-----------------|----------|--------|
| 2026-10-02 | refrigerator-ice-maker-water-filter-guide-peoria-il | Refrigerator and Ice Maker Water Filter Guide for Peoria IL Homes | 1,200 | 15 (9 h2 + 6 h3 + intro + CTA) | LIVE, HTTP 200 verified |
| 2026-09-30 | whole-house-water-softener-installation-cost-peoria-il | Whole House Water Softener Installation Cost in Peoria IL (2026 Guide) | 1,184 | 15 (8 h2 + 7 h3 + intro + CTA) | LIVE, HTTP 200 verified |
| 2026-09-25 | water-softener-salt-types-brine-tank-maintenance-peoria-il | Water Softener Salt Types and Brine Tank Maintenance in Peoria IL | 1,415 | 15 (7 h2 + 5 h3 + intro + CTA + footer) | LIVE, HTTP 200 verified |
| 2026-09-23 | lead-in-drinking-water-peoria-il | Lead in Drinking Water in Peoria IL: What Homeowners Need to Know | 1,726 (body) | 18 (9 h2 + 7 h3 + intro + CTA) | LIVE, HTTP 200 verified |
| 2026-09-18 | water-heater-hard-water-damage-peoria-il | Hard Water and Water Heater Lifespan in Peoria IL | 1,348 | 15 (9 h2 + 4 h3 + intro + CTA) | LIVE, HTTP 200 verified |
| 2026-09-16 | water-filter-replacement-guide-peoria-il | Water Filter Replacement Guide for Peoria IL Homes | 1,225 | 17 (9 h2 + 6 h3 + intro + CTA) | LIVE, HTTP 200 verified |

## Topic rotation — covered (do not duplicate)

Maintenance / cost:
- refrigerator-ice-maker-water-filter-guide-peoria-il (2026-10-02) — fridge/ice maker carbon cartridge guide: what it does and does not remove (no hardness/softening), 6-12 month change interval, spent-filter signs, OEM vs certified-aftermarket pricing table, why hard water makes cloudy ice and a fridge filter cannot fix it, three whole-house integration options (standalone / softener+fridge / under-sink RO feeding the fridge), maintenance checklist
- water-softener-salt-types-brine-tank-maintenance-peoria-il (2026-09-25) — salt grades (solar/pellet/block/potassium chloride), purity, salt usage rate, brine tank fill rules, annual clean-out, bridging/mushing/creep troubleshooting
- water-heater-hard-water-damage-peoria-il (2026-09-18) — hard water damage to water heaters, sediment/scale, lifespan, replacement cost
- water-filter-replacement-guide-peoria-il (2026-09-16) — filter replacement intervals, warning signs, costs
- water-softener-installation-cost-peoria-il (2026-07-29)
- whole-house-water-softener-installation-cost-peoria-il (2026-09-30) — installed-price ranges for a whole house softener in Peoria, cost breakdown table, price drivers (hardness, household size, plumbing access, water source, permits), softener vs conditioner price gap, avoidance guide, install-day walkthrough. NOTE: complements the 07-29 generic cost post but is distinct (whole-house equipment + install labor focus vs generic softener pricing).
- water-softener-vs-water-conditioner-peoria-il (2026-09-11)
- water-softener-vs-water-filter (2026-07-29)
- bottled-water-vs-filtered-water-peoria-il (2026-07-31)

Water quality:
- is-peoria-tap-water-safe (2026-07-29)
- hard-water-problems-peoria-il (2026-07-29)

Health guides:
- lead-in-drinking-water-peoria-il (2026-09-23) — lead sources in older plumbing, service lines, pre-1986 solder, at-risk groups, first-draw testing, what filters do/don't remove lead

Filtration types:
- reverse-osmosis-water-filter-peoria-il (2026-08-05)
- whole-house-water-filtration-guide (2026-07-29)
- whole-house-filter-vs-reverse-osmosis (2026-08-14)
- water-filtration-near-me (2026-08-14)
- water-filtration-guide-peoria-il (2026-08-14)
- winter-water-system-maintenance-peoria-il (2026-08-14)

Well water:
- common-well-water-problems-peoria-il (2026-09-09)
- well-water-filtration-peoria (2026-07-29)

City pages (blog):
- water-filtration-east-peoria-il (2026-08-07)
- water-filtration-pekin-il (2026-08-12)
- water-filtration-washington-il (2026-08-14)
- water-filtration-morton-il (2026-08-19)
- water-filtration-bloomington-il (2026-08-21)
- water-filtration-springfield-il (2026-08-26)
- water-filtration-galesburg-il (2026-08-28)
- water-filtration-canton-il (2026-09-02)
- water-filtration-normal-il (2026-09-04)

Standalone city landing pages (root of site, not blog):
bartonville-, chillicothe-, dunlap-, east-peoria-, germantown-hills-, groveland-,
metamora-, morton-, pekin-, washington-water-filtration-il

## Uncovered topics still available
- Hard water and skin/hair/eczema health angle
- Chloramine vs chlorine removal in Central Illinois
- Well water testing schedule / how to read a lab report
- TDS meters: how to interpret them
- Sulfur / rotten egg smell troubleshooting
- Washing machine and dishwasher hard water damage

## Notes / quirks
- `/blog/index.html` is a STATIC index with hardcoded post cards. New card MUST be inserted as
  the FIRST child of `<div class="blog-grid">` (around line 346 pre-insert). Uses class
  `post-card` / `post-title` / `post-excerpt`, and `Read more &rarr;`.
- Post template: simple inline-CSS layout (`.container` max-width 700px, blue #0066cc theme).
  Copy CSS verbatim from a recent post. Does NOT use the site's Fraunces/Inter homepage CSS.
- Site posts run long naturally: recent posts are 1,247–1,279 article words. Target 800–1,200
  per job spec but expect to land slightly above; the site's established norm is ~1,250.
- `file_count: None` in the Netlify deploy API response is a benign artifact for API-sourced
  deploys. Do NOT treat it as a failed/empty deploy — verify by curling the homepage and post.
- Excluded from deploy manifest by deploy.js: .DS_Store, deploy.js, generate-images.js,
  .git, .gitignore, node_modules.
