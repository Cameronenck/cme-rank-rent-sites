#!/usr/bin/env python3
"""Launch one seller lead-gen site: flip site_url -> real domain, drop noindex,
regenerate canonicals + sitemap, and set production env vars on Netlify.

Usage (ONE command per site):
  python3 launch-seller-site.py --site peoria-cash-buyers [--dry-run] [--apply-env]

--dry-run    print every change, make none.
--apply-env  set Netlify site env vars (RESIMPLI_API_KEY, TO_SLACK_TOKEN,
             SLACK_LEAD_CHANNEL). Requires Cam's "ENV CHANGE APPROVED" — the
             script refuses to set env vars without this flag AND a matching
             approval note is not machine-checkable, so treat the flag as the
             explicit go-ahead only when Cam has granted it.
"""
import os, re, sys, json, subprocess, argparse

REPO = "/Users/bert-aiagent/cme-rank-rent-sites"
GEN = "/Users/bert-aiagent/.hermes/cache/scratch/build_seller_sites.py"
CREDS = "/Users/bert-aiagent/.hermes/openclaw-data/credentials/.env.local"

SITES = {
    "peoria-cash-buyers": {
        "domain": "peoriacashbuyers.com",
        "preview": "https://peoria-cash-buyers.netlify.app",
        "site_id": "06f76226-92d2-4ff6-a0e3-a99427ee9bdf",
        "campaign": "Peoria | SEO | Peoria Cash Buyers",
    },
    "pekin-house-buyers": {
        "domain": "pekinhousebuyers.com",
        "preview": "https://pekin-house-buyers.netlify.app",
        "site_id": "04ab3164-ce63-4a6f-ace1-7324314904fa",
        "campaign": "Tazewell | SEO | Pekin House Buyers",
    },
}


def gen_flip(site, cfg, dry_run):
    """DISABLED — build_seller_sites.py was never committed and has been pruned from the
    scratch cache. The committed HTML is the source of truth for the seller sites."""
    print(f"[content] BLOCKED — build_seller_sites.py is gone (never committed to the repo; "
          f"pruned from ~/.hermes/cache/scratch/). Committed HTML under {site}/ is the source of "
          f"truth. To launch, apply the site_url -> https://{cfg['domain']} and noindex True -> False "
          f"flip directly to the committed HTML pages, not via the generator.")
    sys.exit(2)


def env_vars(site, cfg, dry_run):
    """Compute the env vars to set (site-level). Reads secrets at run time."""
    creds = open(CREDS).read()
    slack_token = re.search(r'^TO_SLACK_TOKEN=(.+)$', creds, re.M).group(1).strip()
    # RESIMPLI_API_KEY from 1Password "TO – RESIMPLI" (Hermes AI Agent vault)
    token = subprocess.run(['security', 'find-generic-password', '-s',
                            '1Password Service Account Token', '-w'],
                           capture_output=True, text=True).stdout.strip()
    env = dict(os.environ, OP_SERVICE_ACCOUNT_TOKEN=token)
    item = subprocess.run(['op', 'item', 'get', 'TO – RESIMPLI', '--vault',
                           'Hermes AI Agent', '--format', 'json'],
                          capture_output=True, text=True, env=env).stdout
    d = json.loads(item)
    resimpli_key = next(f['value'] for f in d['fields'] if f['label'] == 'RESIMPLI_API_KEY')

    vars_to_set = {
        "RESIMPLI_API_KEY": resimpli_key,
        "TO_SLACK_TOKEN": slack_token,
        "SLACK_LEAD_CHANNEL": "C0B2JA21Y30",
        "RESIMPLI_CAMPAIGN_NAME": cfg["campaign"],
    }
    print(f"[env] site_id {cfg['site_id']} — would set {len(vars_to_set)} vars (site-level, per-key PUT):")
    for k, v in vars_to_set.items():
        print(f"      {k} = {v[:6]}...({len(v)} chars)" if len(v) > 12 else f"      {k} = {v}")
    return vars_to_set


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", required=True, choices=list(SITES))
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--apply-env", action="store_true")
    args = ap.parse_args()

    cfg = SITES[args.site]
    print(f"=== LAUNCH {args.site}  {'(DRY RUN)' if args.dry_run else '(REAL)'} ===")
    gen_flip(args.site, cfg, args.dry_run)
    print()
    if args.apply_env:
        env_vars(args.site, cfg, args.dry_run)
    else:
        print("[env] skipped (pass --apply-env to set Netlify env vars — needs Cam's ENV CHANGE APPROVED)")
    if args.dry_run:
        print("\nDRY RUN — nothing changed.")


if __name__ == "__main__":
    main()
