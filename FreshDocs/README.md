# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Prerequisites

It is recommended to use **[nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)**  
to install and manage your Node.js versions consistently across environments.

```bash
# Assume NVM version 0.40.3 is the latest at the time of writing
NVM_VERSION=0.40.3
# Install nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash

# After installation, restart your terminal, then:
nvm install --lts
nvm use --lts

# Verify Node.js version
node -v
npm -v
```

> Using nvm ensures compatibility with the Node.js version required by Docusaurus and prevents dependency issues across different systems.

---

## Installation

Install all dependencies using npm:

```bash
npm install
```

---

## Local Development

Start a local development server:

```bash
npm run start
```

This command starts the Docusaurus dev server and automatically opens a browser window.  
Most changes are reflected live without restarting the server.

---

> **Note**: Sometimes you do not need follow all remaining steps, just **Pull Request** to the main Repo.

## Build

### Build Modes (Secret + Mirror Package)

This repository now uses one deployment build and one mirror packaging step:

- `npm run build:secret` → builds full content to `build-secret`
- `npm run prepare:mirror` → exports only documents with `visibility: public` into `.public/` for mirror sync

For strict security, treat docs as secret unless explicitly marked public.

Example front matter:

```md
---
title: Example
visibility: public
---
```

---

### Notes

- Recommended Node.js version: **LTS (≥ 18)**  
- For consistency, always run commands inside the project root directory (FreshDocs) after activating the correct Node.js version via nvm.
- Recommended git remote strategy:
	- `origin` => `Yangs-AI/Fresh-Secret` (primary development)
	- `public` => `Yangs-AI/Fresh` (public mirror target)
- CI public mirror publishing uses GitHub App secrets:
	- `FRESH_MIRROR_APP_ID`
	- `FRESH_MIRROR_APP_PRIVATE_KEY`
- Public mirror package manifest is `package-public.json` and will be synced as `package.json` in `Yangs-AI/Fresh`.

## Explanation of Architecture
This project uses `Yangs-AI/Fresh-Secret` as source of truth:

- This repository deploys only `secret.fresh.research.jason-young.me` (full content, gateway-protected).
- Public content is synced to `Yangs-AI/Fresh` (mirror repository), and the mirror repository is responsible for public-site deployment.

### Why this model

- Secret content is never shipped to public artifacts.
- URL structure remains flexible (do not need strictly constrained to `/secret/*`).
- Authoring stays in one content tree (no duplicated docs repositories).

### Content metadata

Use front matter in every MDX/Markdown file:

```md
---
title: My page
visibility: public
---
```

or:

```md
---
title: Internal page
visibility: secret
---
```

Rules in this repository:

- `visibility: public` => included in mirror package export
- `visibility: secret` or missing visibility => secret-only
- `access: [...]` => treated as secret-only in public export

### Build commands

Run from `FreshDocs/`:

```bash
npm run build:secret
npm run prepare:mirror
```

`prepare:mirror` runs `scripts/public.ts` and exports the public subset into `.public/`.

### Deployment Strategy Recommendation
This project is designed with gateway-protected hosting for the secret site.
Public site hosting should be configured in the mirror repository.
Below is a recommended deployment architecture:

#### Access control

Recommended runtime model:

1. IAM handles registration/login/admin approval/role assignment.
2. Approved users are assigned role/group `secret`.
3. Gateway validates token and role for **every** request to `secret.fresh.research.jason-young.me`.

Suggested stack:

- IAM: Keycloak or Authentik
- Gateway: Nginx + oauth2-proxy (or Traefik ForwardAuth)

#### Security checklist

- Main docs repository (`Fresh-Secret`) is secret.
- This repository deploys only `build-secret` artifacts.
- Secret site has `noindex` to prevent indexing and private cache policy.
- Public and Secret search indexes are isolated.
- Secret static assets are served only behind auth gateway.

#### CI/CD

Workflow template: `.github/workflows/build.yml`

- `build-secret`: builds secret artifact
- `prepare-mirror-package`: exports public subset for mirror sync
- `deploy-secret`: deploys secret site

#### Public mirror policy

Do **not** push secret source files to the public repository.

#### Repository policy

- Public repository: `Yangs-AI/Fresh` (branch `main`)
- Secret repository: `Yangs-AI/Fresh-Secret` (branch `main`)

#### Development workflow

- Daily development happens in `Fresh-Secret` on branch `main`.
- CI builds `build-secret` (full content) in this repository.
- CI exports `.public` content and syncs it to `Yangs-AI/Fresh` as public mirror source.

Required secret for mirror publishing:

- `FRESH_MIRROR_APP_ID`: GitHub App ID for mirror sync.
- `FRESH_MIRROR_APP_PRIVATE_KEY`: GitHub App private key for mirror sync.

Mirror file mapping:

- `package-public.json` -> `package.json` (in public mirror)
- `docusaurus.config.mirror.ts` -> `docusaurus.config.ts` (in public mirror)
- `README-Public.md` (repo root) -> `README.md` (public mirror root)

Single source of truth note:

- Public root README content is maintained in `README-Public.md` in `Fresh-Secret`.
- Do not manually edit root `README.md` in `Yangs-AI/Fresh`; CI will overwrite it on next sync.
