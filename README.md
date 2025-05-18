# CogniMap

CogniMap is an Electron-based cognitive mapping tool built with Angular 2 and Webpack. It enables users to visually create, edit, and quiz themselves on interactive concept maps offline.

**Demo Video:** https://youtu.be/FcAghOkgQpI

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Menu & Shortcuts](#menu--shortcuts)
- [Data Management](#data-management)
- [Multimedia & Assets](#multimedia--assets)
- [Quiz Mode](#quiz-mode)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Visual Concept Mapping:** Drag-and-drop nodes and connect them with links to build cognitive maps.
- **Offline-First Storage:** Local NeDB for persisting and loading maps without external dependencies.
- **Import/Export:** Load external SVG/JSON maps and export your work.
- **Multimedia Integration:** Open PDFs, text, images, audio, and video directly from the app.
- **Spaced-Repetition Quiz:** Test recall of map elements with an adaptive scheduling algorithm.
- **Fast Development:** Hot Module Replacement via Webpack HMR.
- **Cross-Platform:** Compatible with Windows, macOS, and Linux.

## Installation

**Prerequisites:**
- Node.js (LTS)
- npm

```bash
git clone https://github.com/<your-org>/cognimap.git
cd cognimap
npm install
npm run build:dev    # build assets
npm start            # launch Electron app
```

For live development with auto-reload:

```bash
npm run start:hmr
```

## Usage

1. **Create/Edit Map:** Add nodes and links on the main canvas.
2. **Save Map:** `File → Save DB`.
3. **Load Map:** `File → Load DB`.
4. **Delete Map:** `File → Delete DB`.
5. **Import File:** `File → Load File`.
6. **Select Image Folder:** `File → Select IMG Folder`.

## Menu & Shortcuts

### File
- Save DB
- Load DB
- Delete DB
- Load File
- Select IMG Folder
- Quit: `Cmd/Ctrl + Alt + Q`

### View
- Zoom In: `Cmd/Ctrl + +`
- Zoom Out: `Cmd/Ctrl + -`
- Reset Zoom: `Cmd/Ctrl + 0`
- Reload: `Cmd/Ctrl + R`
- Toggle Full Screen: `F11` (Win/Linux) or `Ctrl+Cmd+F` (macOS)
- Toggle DevTools: `Ctrl+Shift+I` (Win/Linux) or `Alt+Cmd+I` (macOS)

## Data Management

Maps are stored at `./data/cme.db` using NeDB. The app autoloads existing databases on startup.

## Multimedia & Assets

- **Open Files:** PDFs, text, links, audio, video, and images via built-in handlers.
- **Asset Explorer:** Browse and load files from `src/assets`.

## Quiz Mode

Activate quiz mode to review nodes. CogniMap uses a spaced-repetition algorithm to schedule reviews based on performance.

## Customization

Use the **Settings** panel to adjust:
- Application mode (edit, view, quiz)
- Button layouts
- Color palettes
- Special characters
- Node templates

## Contributing

We welcome contributions:

1. Fork the repo
2. Create a feature branch
3. Ensure tests pass and build succeeds
4. Submit a pull request

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.
