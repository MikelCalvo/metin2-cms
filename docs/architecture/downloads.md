# Downloads architecture

## Goal

Expose a stable starter-pack entrypoint from the CMS without committing host-specific distribution URLs to git.

## Current shape

- `/downloads` is the user-facing CMS page for client delivery
- `STARTER_PACK_URL` is an optional runtime environment variable
- `/downloads/client` is the CMS-owned redirect path used by the UI

## Why this shape

The backing file may live on infrastructure that should not be hardcoded in the repository.

Keeping the real distribution URL in `STARTER_PACK_URL` gives us:
- a stable CMS route and button for users
- no host-specific download endpoint in committed source
- flexibility to move storage or proxy layout later without changing page markup

## Runtime behavior

### When `STARTER_PACK_URL` is configured

- `/downloads` renders a live “Download starter pack” call to action
- that CTA points to `/downloads/client`
- `/downloads/client` redirects to the configured starter-pack URL

### When `STARTER_PACK_URL` is missing

- `/downloads` shows a pending-publication state instead of a broken CTA
- `/downloads/client` redirects back to `/downloads`

## Operational rule

- keep the concrete starter-pack URL in environment configuration only
- do not commit infrastructure-specific storage or reverse-proxy URLs to git
- keep the CMS page as the canonical user-facing download surface even if the actual file hosting changes later