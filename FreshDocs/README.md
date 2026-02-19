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

### Dual-site Build (Public + Secret)

This repository supports two independent builds from the same content source:

- `npm run build:public` → exports only documents with `visibility: public`, then builds to `build-public`
- `npm run build:secret` → builds full content to `build-secret`
- `npm run build:dual` → builds both

Public filtering logic is implemented in `scripts/public.ts` and public build config is `docusaurus.config.public.ts`.

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

## Explanation of Dual-site Architecture
This project uses a **single secret repository** as source of truth and generates two independent sites:

- `public.fresh.research.jason-young.me` (public only)
- `secret.fresh.research.jason-young.me` (full content, gateway-protected)

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

- `visibility: public` => included in public build
- `visibility: secret` or missing visibility => secret-only
- `access: [...]` => treated as secret-only in public export

### Build commands

Run from `FreshDocs/`:

```bash
npm run build:public
npm run build:secret
npm run build:dual
```

`build:public` first runs content export script (`scripts/public.ts`) and then builds with `docusaurus.config.public.ts`.

### Deployment Strategy Recommendation
This project is designed to be deployed on Anywhere with a static file hosting service for the public site and a gateway-protected hosting for the secret site.
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
- Public pipeline only deploys `build-public` artifacts.
- Secret site has `noindex` to prevent indexing and private cache policy.
- Public and Secret search indexes are isolated.
- Secret static assets are served only behind auth gateway.

#### CI/CD

Workflow template: `.github/workflows/build.yml`

- `build-public`: builds public artifact
- `build-secret`: builds secret artifact
- `deploy`: placeholder for your infra deployment steps

#### Public mirror policy

Do **not** push secret source files to the public repository.

Use one of these strategies:

1. Artifact mirror (recommended): publish only `build-public` static output.
2. Source mirror: CI exports only public-marked docs to a dedicated public repo.

#### Repository policy

- Public repository: `Yangs-AI/Fresh` (branch `main`)
- Secret repository: `Yangs-AI/Fresh-Secret` (branch `main`)

#### Development workflow

- Daily development happens in `Fresh-Secret` on branch `main`.
- CI builds both outputs:
	- `build-public` (public-only)
	- `build-secret` (full content)
- CI publishes `build-public` to `Yangs-AI/Fresh` branch `main` as public mirror.

Required secret for mirror publishing:

- `FRESH_MIRROR_APP_ID`: GitHub App ID for mirror sync.
- `FRESH_MIRROR_APP_PRIVATE_KEY`: GitHub App private key for mirror sync.

Mirror file mapping:

- `package-public.json` -> `package.json` (in public mirror)
- `docusaurus.config.public.ts` -> `docusaurus.config.ts` (in public mirror)
- `README-public.md` (repo root) -> `README.md` (public mirror root)

Single source of truth note:

- Public root README content is maintained in `README-public.md` in `Fresh-Secret`.
- Do not manually edit root `README.md` in `Yangs-AI/Fresh`; CI will overwrite it on next sync.
