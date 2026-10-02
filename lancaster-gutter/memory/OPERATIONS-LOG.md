# Gutter Installation Lancaster — Operations Log

## 2026-09-25 — Blog published: Gutter Guards in York PA

**Post:** Gutter Guards in York PA: Cost, Types & Are They Worth It?
**URL:** https://gutterinstallationlancaster.com/blog/gutter-guards-york-pa-cost-types-worth-it/
**Slug:** gutter-guards-york-pa-cost-types-worth-it
**Words:** 1267 | **Sections:** 20 (11 h2 + 5 h3 + intro/CTA/closing/nav) | Emojis: 0
**Topic category:** Gutter guard guide (types, cost, worth-it) — rotated to York PA (was under-covered at 1 post)
**Deploy ID:** 6ab6713a0feb6946cde7499c (Netlify, state=ready)
**Rollback reference (prior live deploy):** 6ab3ce6cf8b366be6815ddca
**Verified live:** HTTP 200 new post, homepage 200, blog index 200, sitemap 200; 10 other pages spot-checked 200 (no wipe)

**Sitemap drift fixed in this deploy:** `gutter-installation-cost-york-pa` and
`gutter-installation-marietta-pa` were live + on disk but missing from sitemap.xml.
Both added. Sitemap drift check now reports "OK: no sitemap drift" (51 dirs).

### BLOCKER — git push failing (read-only GitHub token)
- Local commit `1971a50` exists and is correct (3 files: post, blog/index.html, sitemap.xml).
- `git push origin main` → **403 "Permission to Cameronenck/cme-rank-rent-sites.git denied"**.
- Root cause: `~/.git-credentials` has two entries — `forge-mac-mini` (valid, authenticates as
  Cameronenck, can READ repo) and `token` (**invalid — "Bad credentials"**).
  The `forge-mac-mini` PAT is **fine-grained with read-only Contents** — API returns
  "Resource not accessible by personal access token" on any write (tag create, branch
  protection read), though its repo `permissions` object shows admin:true (that's the *user's*
  role, not the token's scope).
- **Impact:** post is live via Netlify API (approved path), but the git repo is NOT updated.
  `git rev-list --count origin/main..HEAD` = 89 unpushed commits (includes sibling agents' work).
- **Risk:** if any other cron job later pushes to this repo, Netlify's git-sourced rebuild will
  OVERWRITE the API-deployed post. Needs a write-capable token to close out.
- **Escalated to:** Hermes.

---

## 2026-09-30 — Blog deploy (lancaster-gutter)

- **Post:** "Why Your Gutters Overflow in Lancaster PA: Slope, Pitch, and How to Fix It"
- **Slug:** gutter-slope-pitch-overflow-lancaster-pa
- **Topic:** Gutter slope/pitch troubleshooting (first coverage of this topic on the site; gap check confirmed zero prior posts on slope/pitch/overflow)
- **Word count:** 1250 | **Sections:** 10 h2 + 5 h3 + intro + CTA = 17
- **Cities:** Lancaster, Lititz, Manheim, Elizabethtown, Mount Joy, Columbia
- **Quality gate:** PASS (no emoji, no fabricated content, tel:+17177166410, balanced tags, 0 numeric entities, 0 555 numbers, Inter via Google Fonts CDN)
- **Sitemap:** entry added, XML parses OK, check-sitemap-drift.sh = "no sitemap drift" (52 posts)
- **Blog index:** new card inserted first
- **Deploy:** `node deploy.js` → 89-file manifest, 4 files uploaded (post, blog/index.html, sitemap.xml, memory log), deploy ID 6abd089f57e44f4fb5429631
- **Verified live:** homepage HTTP 200, post HTTP 200, title tag correct, keywords present, no emoji on live HTML, tel link live, index card live, sitemap live
- **Git push:** 403 (known read-only PAT defect — unchanged). Commit 252e322 recorded locally. Post is live via Netlify API (approved path).
- **Note:** shared repo has many sibling agents' uncommitted changes on disk (float, peoria-water-filtration, ohio-hvac, deck, memory). deploy.js deploy is scoped to this site's directory tree only — those are unaffected.
