# CogniMap

CogniMap is a browser-based cognitive mapping tool built with Angular and a
lightweight local Node.js backend. It enables users to visually create, edit,
and quiz themselves on interactive concept maps — fully offline, with all
data stored locally.

**Demo Video:** https://youtu.be/FcAghOkgQpI

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Data Management](#data-management)
- [Multimedia & Assets](#multimedia--assets)
- [Quiz Mode](#quiz-mode)
- [Customization](#customization)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Visual Concept Mapping:** Drag-and-drop nodes and connect them with links to build cognitive maps.
- **Browser-First, Offline:** Runs in any modern browser against a local backend — no Electron required. Local NeDB persistence without external dependencies.
- **Import/Export:** Load external JSON maps and export your work.
- **Multimedia Integration:** Open PDFs, text, links, images, audio, and video from map elements.
- **Spaced-Repetition Quiz:** Test recall of map elements with an adaptive scheduling algorithm.
- **Dockable Widgets:** LaTeX/MathJax editor, code editor (CodeMirror), chemical structure editor (JSME), SVG vector editor, navigator, minimap, and mnemonics — in two dockable slots.
- **Dark/Light Theme:** Follows the OS preference, with a manual toggle.
- **Cross-Platform:** Anywhere Node.js and a browser run.

## Installation

**Prerequisites:**
- Node.js ≥ 18
- npm

```bash
git clone https://github.com/PMK89/CogniMap.git
cd CogniMap
npm install
npm run build      # build the frontend into dist/
npm start          # serve app + APIs at http://127.0.0.1:3210
```

Open http://127.0.0.1:3210 in your browser.

For live development with rebuild-on-change:

```bash
npm run dev        # backend on :3210, webpack dev server on :3000
```

## Usage

1. **Create/Edit Map:** Add nodes and links on the main canvas (edit mode).
2. **Save/Load/Export:** maps persist automatically to the local database; JSON import/export is available through the backend APIs (`/api/db/save`, `/api/db/load`).
3. **Widgets:** pick widgets for the two dock slots from the navigation toolbar.
4. **Search and navigation:** press `Ctrl+K` for ranked search, type filters, recent concepts and previous location. Opening a result also focuses it in the active 3D view.
5. **Theme:** select System, Light or Dark in workspace tools, or toggle dark/light with the ◐ button.
6. **JSON Canvas:** expand Import and export in workspace tools. Preview before importing; existing identities are never overwritten. Transfer referenced media separately.
7. **Review:** use the Map review toolbar to reveal, grade and undo the latest rating. A same-day session resumes after restart; Start / refresh due starts a new queue.

## Data Management

Maps are stored at `./data/cme.db` using NeDB; settings, colors, buttons,
templates, special characters and quiz scheduling live as JSON files under
`./data/`. The formats are unchanged from earlier (Electron-based) versions —
existing data loads as-is. Before the first write of each run, the affected
file is backed up to `data/backups/`.

Set `COGNIMAP_DATA_DIR` to use a different data directory.

## Multimedia & Assets

- **Open Files:** PDFs, text, links, audio, video, and images open in browser tabs via the `/files/` API.
- **Asset Explorer:** Browse and attach files from `src/assets` in the navigator widget.

## Quiz Mode

Activate quiz mode to review nodes. CogniMap uses a spaced-repetition
algorithm (SM2 variant) to schedule reviews based on performance.

## Customization

Use the **Settings** panel to adjust:
- Application mode (edit, view, quiz)
- Button layouts
- Color palettes
- Special characters
- Node templates

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Local development & testing](docs/DEVELOPMENT.md)
- [Migration notes (Electron → browser)](docs/MIGRATION.md)
- [Modernization architecture and compatibility](docs/modernization/ARCHITECTURE-COMPATIBILITY.md)
- [Modernization plan and verification status](docs/modernization/PLAN.md)

## Contributing

We welcome contributions:

1. Fork the repo
2. Create a feature branch
3. Ensure tests pass (`npm test`, `npm run test:e2e`) and the build succeeds
4. Submit a pull request

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.
