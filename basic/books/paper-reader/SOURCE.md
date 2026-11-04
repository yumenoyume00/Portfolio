## Current primary portrait source

The selected source is `/Users/zoumeng/Downloads/作品集 竖  297.pdf`, SHA-256 `835d01ff670d169b96143766037fadfccd6eaae3b0ded845f5c45e9fb5c66c56`. The source is copied unchanged to `portfolios/portrait-current.pdf`. Its 61 PDF pages become 120 leaves, at the same 2800px height and lossless WebP encoding as the prior HQ edition. Exact encoded-image hashes reuse119 unchanged leaves; the revised left introduction/photo leaf4 is stored under `pages-current/`. `pages-desk-current.json` and `book-info-desk-current.json` are the active primary manifests. Published Room files remain separate and unchanged. `scripts/prepare-current-portrait.py` reproduces the extraction.

Current source PDF (unchanged): /Users/zoumeng/Desktop/2026 求职用/作品集1103.pdf
PDF pages: 61
Reader pages: 120
Updated locally on November 3; rendered leaves in pages-1103/. Previous manifest, PDF and cover preserved in .local-snapshots/2026-11-03-portrait/; previous pages-latest/ assets retained.
Merged spreads split at exact half width; cover and final page retained.
Engine: https://github.com/dodola/paper-mono-pager (MIT), vendored license in vendor/LICENSE.
Local preview only.
Desk high-quality variant: pages-hq.json references lossless 2800px leaves in pages-1103-hq/, rerendered from the same unchanged original via scripts/prepare-portrait-hq.py. Existing pages.json and prior assets remain available; only quality=retina readers use this variant.
# November 4 local retina presentation

`books/landscape/apps-only-hq.json` retains the same41 single-sided leaves and source-page mapping as `apps-only.json`. `scripts/prepare-landscape-hq.py` renders those leaves directly from the designer's existing `ポートフォリ_ZOU MENG（スウム）.pdf` at3200px long edge and saves lossless WebP files in `books/landscape-hq/`. Original PDF, older page assets and manifests are retained. Only `quality=retina` opts into this manifest and source-resolution texture canvases. Default/published reader behavior remains unchanged.

# November 4 updated portrait, desk only

`pages-desk-1104.json` and `book-info-desk-1104.json` derive from the designer-supplied `/Users/zoumeng/Desktop/2026 求职用/作品集1104.pdf`. The61-page original is copied unchanged to `public/portfolios/portrait-1104.pdf`;120 leaves are rendered losslessly at2800px height in `pages-1104-hq/`, splitting merged spreads at their exact midpoint. The `edition=desk-1104` parameter opts into this version; older/default manifests remain unchanged. Preparation: `scripts/prepare-desk-portrait-1104.py`. Packaging and the second illustration-study chapter have no destination arrows in the desk-specific navigation registry.

