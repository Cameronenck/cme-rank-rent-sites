# Decisions

## Seller sites — source of truth (2026-11-10)

- **Committed HTML is the source of truth for the seller sites** (`pekin-house-buyers/`, `peoria-cash-buyers/`, etc.). The generator `build_seller_sites.py` was never committed and was pruned from the scratch cache, so the committed HTML under each site folder is authoritative.
- **Never keep build tools only in the scratch cache.** Any generator/build script that produces committed output must be committed to the repo alongside its output, or it will be lost to the 24-hour scratch prune (`~/.hermes/cache/scratch/`).
