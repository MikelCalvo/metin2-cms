# Downloads architecture

## Goal

Expose a stable starter-pack entrypoint from the CMS without committing host-specific distribution URLs to git.

## Current shape

- `/downloads` is the user-facing CMS page for client delivery
- `STARTER_PACK_URL` is the runtime URL of the starter-pack archive
- `STARTER_PACK_SHA256` is an optional runtime hash used to show the visible checksum in the downloads UI
- `STARTER_PACK_USERNAME` and `STARTER_PACK_PASSWORD` are optional runtime credentials for protected downloads
- `/downloads/client` is the CMS-owned archive path used by the UI
- `/downloads/client/checksum` is the CMS-owned checksum path used by the UI

## Why this shape

The backing file may live on infrastructure that should not be hardcoded in the repository.

Keeping the real distribution URL and credentials in runtime env gives us:
- a stable CMS route and button for users
- no host-specific download endpoint in committed source
- no download credentials in committed source
- flexibility to move storage or proxy layout later without changing page markup

## Runtime behavior

### When `STARTER_PACK_URL` is configured

- `/downloads` renders a live “Download starter pack” call to action
- `/downloads` also exposes a checksum entrypoint
- those CTAs point to `/downloads/client` and `/downloads/client/checksum`

### When `STARTER_PACK_SHA256` is also configured

- `/downloads` can show the visible checksum inline in the release card
- the checksum file route still remains available for manual verification and mirrors

### When `STARTER_PACK_USERNAME` and `STARTER_PACK_PASSWORD` are also configured

- `/downloads/client` proxies the archive through the CMS with server-side Basic Auth
- `/downloads/client/checksum` proxies the checksum through the CMS with server-side Basic Auth
- the browser never needs to know the backing credentials
- resumable archive downloads remain available because the CMS forwards `Range` / `If-Range` and preserves `206 Partial Content`

### When only `STARTER_PACK_URL` is configured

- `/downloads/client` redirects to the configured starter-pack URL
- `/downloads/client/checksum` redirects to the derived checksum URL (`${STARTER_PACK_URL}.sha256`)

### When `STARTER_PACK_URL` is missing

- `/downloads` shows a pending-publication state instead of a broken CTA
- `/downloads/client` redirects back to `/downloads`
- `/downloads/client/checksum` redirects back to `/downloads`

## Operational rule

- keep the concrete starter-pack URL in environment configuration only
- keep the visible checksum in environment configuration if the UI should expose it inline
- keep download credentials in environment configuration only
- do not commit infrastructure-specific storage or reverse-proxy URLs to git
- keep the CMS page as the canonical user-facing download surface even if the actual file hosting changes later