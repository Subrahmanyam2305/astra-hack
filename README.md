# MolSight — AI Drug-Protein Visualizer

> **Team: Ad Astra Per Aspirin** · Hackathon 2026

MolSight is an AI-powered drug-protein visualizer that fetches real 3D molecular structures from the Protein Data Bank, renders them interactively in the browser, and uses GPT-6 Astra to analyze binding sites, molecular interactions, and clinical relevance — giving biologists a tool that makes drug discovery more visual and intuitive.

## Features

- **Real 3D protein structures** — Fetches authentic PDB data from [RCSB Protein Data Bank](https://www.rcsb.org)
- **Drug molecule overlay** — Retrieves 3D drug structures from [PubChem](https://pubchem.ncbi.nlm.nih.gov) and renders them alongside the protein
- **Multiple render modes** — Cartoon (ribbon), Stick, Sphere, and Surface views with one-click toggling
- **AI interaction analysis** — GPT-6 Astra identifies binding sites, key residues, hydrogen bonds, hydrophobic contacts, and clinical relevance
- **Interactive 3D viewer** — Rotate, zoom, pan, spin animation, and drug visibility toggle
- **Pre-loaded examples** — 6 well-known protein-drug pairs ready to demo (SARS-CoV-2 + Paxlovid, Abl Kinase + Gleevec, HER2 + Herceptin, and more)

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and add your OpenAI API key
cp .env.example .env.local
# Edit .env.local and set OPENAI_API_KEY=sk-...

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Enter a protein** (PDB ID like `6LU7`) and a **drug name** (like `Nirmatrelvir`), or pick from 6 pre-loaded examples
2. MolSight fetches the real 3D protein structure from RCSB PDB and the drug molecule from PubChem — simultaneously
3. GPT-6 Astra analyzes the protein-drug pair, identifying binding sites, key molecular interactions, affinity data, and clinical context
4. The protein is rendered in 3D using [3Dmol.js](https://3dmol.csb.pitt.edu/) with rainbow spectrum ribbon diagrams
5. The drug molecule is overlaid as a green stick model, togglable on/off
6. Switch between Cartoon, Stick, Sphere, and Surface views; toggle molecular surface rendering
7. Read Astra's analysis panel for binding site details, interaction types, clinical relevance, and suggested drug modifications

## Example Pairs

| PDB ID | Drug | Target |
|--------|------|--------|
| `6LU7` | Nirmatrelvir | SARS-CoV-2 Main Protease (Paxlovid) |
| `1HWI` | Imatinib | Abl Kinase (Gleevec for CML) |
| `4HJO` | Trastuzumab | HER2 (Herceptin for breast cancer) |
| `3EML` | Erlotinib | EGFR (Tarceva for lung cancer) |
| `2HYY` | Oseltamivir | Neuraminidase (Tamiflu for influenza) |

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **3Dmol.js** for molecular 3D visualization
- **OpenAI API** (GPT-6 Astra) for binding site analysis
- **RCSB PDB API** for protein structures
- **PubChem API** for drug molecules
- **Tailwind CSS** for styling

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Main UI — input form, loading, viewer layout
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Tailwind + custom styles
│   └── api/
│       ├── fetch-molecules/  # Fetches PDB + SDF data from public databases
│       └── analyze/          # Sends protein-drug pair to Astra for analysis
├── components/
│   ├── Header.tsx            # App header with branding
│   ├── MolViewer.tsx         # 3Dmol.js viewer with render mode controls
│   └── AnalysisPanel.tsx     # Displays Astra's interaction analysis
├── lib/
│   └── types.ts              # TypeScript interfaces
└── types/
    └── 3dmol.d.ts            # 3Dmol.js type declarations
```

## Disclaimer

This tool provides AI-assisted analysis for educational and research exploration purposes. It is **not a substitute for peer-reviewed research or experimental validation**. Always verify findings with primary literature and laboratory data.

---

*Built with love and caffeine by Team Ad Astra Per Aspirin — "To the stars, through medicine."*
