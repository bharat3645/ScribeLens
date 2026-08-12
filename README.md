# NeuroOCR

[![CI](https://github.com/bharat3645/neuro-ocr/actions/workflows/ci.yml/badge.svg)](https://github.com/bharat3645/neuro-ocr/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

**Where paper meets AI.** NeuroOCR is a browser-based handwritten text recognition tool: drop in a photo of handwritten notes, a scanned document, or a receipt, and get back clean, editable, copyable text — entirely client-side, with no server, no upload, and no API key.

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Testing & CI](#testing--ci)
- [Project structure](#project-structure)
- [Known limitations](#known-limitations)
- [License](#license)

## Overview

OCR tools typically mean uploading a document to someone else's server. NeuroOCR does the whole job in the tab: image preprocessing, text recognition, and post-processing all run on-device using WebAssembly and (optionally) TensorFlow.js. Nothing leaves the browser, so there's nothing to configure and nothing to trust with your documents.

## Features

- **Drag & drop or click-to-upload** image input, with instant preview
- **Upload validation** — the file picker and drag-and-drop both reject unsupported file types, empty files, and files over 15 MB with a clear on-screen message, instead of failing silently deep inside the OCR pipeline
- **Client-side OCR** powered by [Tesseract.js](https://github.com/naptha/tesseract.js) (WebAssembly) — nothing ever leaves the browser
- **Image preprocessing** (grayscale conversion + contrast boost via canvas) applied before recognition to improve accuracy on photographed handwriting
- **Confidence score** shown alongside every result
- **Editable output** — correct any recognition mistakes directly in the results box
- **Copy to clipboard** or **download as `.txt`**
- **Persistent session history** — past results (text, confidence, and timestamp) are saved to `localStorage`, capped at 50 entries, so they survive a page reload; individual entries can be removed, or the whole history cleared, from the sidebar
- **Optional custom model support** — drop a TensorFlow.js model at `public/models/model.json` and NeuroOCR loads it automatically to augment recognition; without one, it runs on Tesseract alone

## Tech Stack

| Layer            | Choice                                            |
| ----------------- | -------------------------------------------------- |
| UI                | React 18 + TypeScript                              |
| Routing           | React Router (`/` and `/about`)                    |
| Styling           | Tailwind CSS (custom "paper" theme)                |
| OCR engine        | Tesseract.js (WebAssembly, in-browser)             |
| Optional inference| TensorFlow.js (`@tensorflow/tfjs`)                 |
| Build tooling     | Vite                                                |
| Icons             | lucide-react                                        |
| Testing           | Vitest + React Testing Library + jsdom             |
| CI                | GitHub Actions                                      |

There is no backend. Recognition runs entirely in the user's browser — no server, no API keys, no environment variables.

## Architecture

```
                     ┌───────────────────────┐
   File picker /     │        App.tsx         │
   drag & drop  ───▶ │  upload → validate     │
                     └──────────┬────────────┘
                                │ File
                                ▼
                     ┌───────────────────────┐
                     │ fileValidation.ts      │  type / size checks
                     └──────────┬────────────┘
                                │ valid File
                                ▼
                     ┌───────────────────────┐
                     │ modelService.ts        │
                     │  1. canvas preprocess  │  grayscale + contrast
                     │  2. Tesseract.js worker│  WASM OCR
                     │  3. textCleanup.ts     │  post-process text
                     │  (+ optional TF.js     │  model augmentation)
                     └──────────┬────────────┘
                                │ { text, confidence }
                                ▼
                     ┌───────────────────────┐
                     │ useHistory hook  ──▶   │  persisted to localStorage
                     │ results view (edit/    │
                     │ copy/download)         │
                     └───────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+

### Install & run

```bash
git clone https://github.com/bharat3645/neuro-ocr.git
cd neuro-ocr
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

### Other scripts

```bash
npm run build       # type-checked production build (outputs to dist/)
npm run preview     # preview the production build locally
npm run lint         # run ESLint
npm test             # run the Vitest test suite once
npm run test:watch   # run tests in watch mode
```

No environment variables or API keys are required — the app has no server-side component.

## Usage

1. Open the app and drop an image onto the upload area, or click to choose a file (JPEG, PNG, WebP, BMP, or GIF, up to 15 MB).
2. NeuroOCR previews the image, preprocesses it, and runs it through the OCR pipeline.
3. Review the recognized text alongside its confidence score. Edit directly in the output box to fix any mistakes.
4. Copy the result to the clipboard or download it as a `.txt` file.
5. Past results are saved automatically in the **History** sidebar — reopen, remove individual entries, or clear the whole list at any time.

To augment recognition with your own model, place a TensorFlow.js model at `public/models/model.json`; NeuroOCR picks it up automatically on startup.

## Testing & CI

Unit and component tests are written with [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/react):

- `postProcessText` — the OCR text-cleanup logic (`src/utils/textCleanup.ts`)
- `validateImageFile` — upload type/size validation (`src/utils/fileValidation.ts`)
- `useHistory` — the persisted-history hook, including localStorage round-tripping and the 50-entry cap (`src/hooks/useHistory.ts`)
- `History` — the sidebar component's rendering and interactions (`src/components/History.tsx`)

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and a production build on every push and pull request against `main`.

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # top navigation
│   │   ├── History.tsx        # collapsible sidebar of past results
│   │   ├── Features.tsx       # "why NeuroOCR" section on the home page
│   │   └── About.tsx          # /about page
│   ├── hooks/
│   │   └── useHistory.ts      # localStorage-backed session history
│   ├── services/
│   │   └── modelService.ts    # Tesseract.js + optional TensorFlow.js pipeline
│   ├── utils/
│   │   ├── fileValidation.ts  # upload type/size validation
│   │   └── textCleanup.ts     # OCR output post-processing
│   ├── test/
│   │   └── setup.ts           # Vitest + jsdom test setup
│   ├── App.tsx                 # main OCR workflow (upload -> recognize -> edit/export)
│   └── main.tsx
├── public/
│   └── favicon.svg
├── .github/workflows/ci.yml    # lint + typecheck + test + build on push/PR
└── index.html
```

## How It Works

1. An image is selected (via file picker or drag-and-drop), validated for type and size, and previewed. Invalid files are rejected with an on-screen explanation instead of being sent to the OCR pipeline.
2. The image is drawn to an off-screen canvas and converted to grayscale with a contrast boost, which measurably improves OCR accuracy on photographed handwriting compared to feeding Tesseract the raw photo.
3. The preprocessed image is passed to a Tesseract.js worker configured for English with a character whitelist and a page-segmentation mode tuned for prose-style handwriting.
4. If a custom TensorFlow.js model is present at `public/models/model.json`, it is loaded at startup and available to augment recognition; otherwise the app runs on Tesseract alone, automatically and silently.
5. The recognized text and its confidence score are shown, saved to the persisted session history (`localStorage`), and made available to copy or download.

## Known Limitations

- Recognition quality depends heavily on image quality and handwriting legibility, like any OCR engine.
- Only image formats (JPEG, PNG, WebP, BMP, GIF) up to 15 MB are supported — there is no PDF parsing.
- History is stored in the browser's `localStorage`, capped at the 50 most recent results; it will not sync across devices or browsers, and clearing site data removes it.
- The production bundle is a single ~1.8 MB chunk (Tesseract.js + TensorFlow.js are both sizeable); code-splitting via dynamic `import()` would be the next optimization if bundle size becomes a concern.

## Contributing

Issues and pull requests are welcome. Please run `npm run lint`, `npx tsc -b`, and `npm test` before submitting a PR — the CI workflow enforces all three.

## License

MIT © [bharat3645](https://github.com/bharat3645) — see [LICENSE](./LICENSE) for the full text.
