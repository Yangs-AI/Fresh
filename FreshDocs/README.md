# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Prerequisites

It is recommended to use **[nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)**  
to install and manage your Node.js versions consistently across environments.

```bash
# Install nvm (Linux/macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

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

Generate static files for production :

```bash
npm run build
```

The static content will be generated in the `build` directory  
and can be served by any static file hosting service.

---

## Deployment

### Using SSH

```bash
USE_SSH=true npm run deploy
```

### Without SSH

```bash
GIT_USER=<your-github-username> npm run deploy
```

If you are using GitHub Pages for hosting, this command conveniently builds the website  
and pushes the content to the `gh-pages` branch.

---

### Notes

- Recommended Node.js version: **LTS (≥ 18)**  
- For consistency, always run commands inside the project root directory (FreshDocs) after activating the correct Node.js version via nvm.
