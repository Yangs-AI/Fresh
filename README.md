<p align="center">
  <img src="https://raw.githubusercontent.com/Yangs-AI/Fresh/refs/heads/main/FreshDocs/static/img/logo.svg" alt="Fresh Logo" width="160"/>
</p>

<h1 align="center">Fresh</h1>

<p align="center"><b>F</b>riendly <b>RES</b>earch <b>RES</b>ources <b>H</b>ub</p>
<p align="center"><i>Making research resources easy to find, reuse, and share — documenting assets for reproducible research.</i></p>

---

## What is Fresh?

**Fresh** is an open and evolving library designed for researchers.  
It provides reusable components for every part of academic writing, from data visualization code, tables and algorithm pseudocode in LaTeX format, to `.bib` references, writing assets, and research utilities.

Each entry in Fresh is:

- *Plug-and-Play*: directly usable or easily adaptable
- *Reproducible*: accompanied by minimal working examples
- *Traceable*: linked to sources and references
- *Friendly*: designed to help researchers share knowledge efficiently

---

## Repository Structure

```
FreshDocs/
 ├── news/                 # Announcements
 ├── memo/                 # Research components
 └── .../                  # Other things
```

---

## How to Contribute

We warmly welcome contributions from the research community!  
If you have a useful visualization snippet, LaTeX code, or writing assets, you can easily add it to Fresh.

### Step-by-Step Guide

1. **Fork** this repository to your own GitHub account.  
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Fresh.git
   ```
3. Enter the documentation workspace and install dependencies:
   ```bash
   cd FreshDocs
   npm install
   ```
4. **Create a new branch** for your contribution:
   ```bash
   git checkout -b new-feature
   ```
5. **Add your new content** under the appropriate directory, e.g.:
   ```
   FreshDocs/memo/visualization_recipes/vilion_plot/
   ```
   Each entry should include:
   - `README.md` describing usage and references
   - Example code
   - Citation or original source if applicable
6. Preview your contribution locally to ensure it builds correctly:
   ```bash
   npm run start
   ```
   This command launches a local Docusaurus development server so you can check that your new content renders properly.
7. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Add: new visualization component for dataset analysis"
   git push origin new-feature
   ```
8. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Add: new visualization component for dataset analysis"
   git push origin new-feature
   ```
9. **Open a Pull Request** back to `main`:
   - Provide a short, descriptive title.
   - Include context and reference if relevant.

Once reviewed, your contribution will become part of the Fresh library.

---

## Contribution Philosophy

Fresh is not just a repository, it's a **collective memory of reusable research design**.  
Every contribution, big or small, helps build a more connected and transparent research ecosystem.

We encourage:
- Clean, minimal, reproducible code
- Clear documentation and example inputs/outputs
- Proper citation of original sources

---

## Maintainers

Fresh is maintained by **Yangs-AI Research Group**,  
with ongoing support from collaborators and community contributors.

---

## A Fresh Beginning

Research becomes powerful when it's shared, not just as papers, but as reusable building blocks.
