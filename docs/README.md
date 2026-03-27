# DATEX Workbench

Developer tooling UI for the DATEX runtime, built with Vue 3 and TypeScript.

## Overview

DATEX Workbench provides a suite of tools for developers learning and working with DATEX:

- **Block Protocol Viewer** - Inspect and analyze DATEX binary block structures
- **Network Inspector** - Monitor network traffic and message routing
- **Code Editor** - Write and test DATEX code with syntax highlighting
- **REPL** - Interactive DATEX terminal
- **Pointer Explorer** - Navigate and inspect DATEX pointers
- **ComHub Overview** - Manage communication hub endpoints and interfaces

## Tech Stack

- **Vue 3.5** - UI framework with Composition API
- **TypeScript** - Type-safe development
- **Vite** - Build tooling and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Vitest** - Unit testing
- **Vue Router** - Client-side routing
- **VueUse** - Composition utilities
- **shadcn/ui** - Component library (via Reka UI)
- **Monaco Editor** - Code editing
- **AG Grid** - Data tables

## Quick Start

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test:unit
```

## Project Structure

```
src/
├── App.vue              # Root application component
├── main.ts              # Application entry point
├── assets/              # Static assets (CSS, images)
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── BlockViewer/     # Block protocol visualization
│   ├── Editor/          # Code editor components
│   ├── NetworkInspector/# Network traffic monitoring
│   ├── endpoint/        # Endpoint management views
│   └── *.vue           # Shared components
├── composable/          # Vue composables (stateful logic)
├── lib/
│   ├── utils.ts         # Utility functions (cn, valueUpdater)
│   ├── runtime.ts       # DATEX runtime integration
│   ├── pointer-utils.ts # Pointer utilities
│   └── pointer-types.ts# Pointer type definitions
├── router/
│   └── index.ts         # Route definitions
├── types/               # TypeScript type definitions
│   ├── layout.ts        # Layout tree types
│   ├── FileTree.ts      # File tree types
│   └── NetworkInspector/# Network inspector types
├── utils/               # Pure utility functions
└── views/               # Route-level view components
    ├── BlockViewer/
    ├── Editor/
    ├── NetworkInspector/
    ├── Repl/
    ├── WelcomeView.vue
    └── WindowGeneralView.vue
```

## Key Features

### Layout System

The application uses a tree-based layout system that supports:

- Nested panel layouts
- Horizontal and vertical splits
- Resizable panels with drag handles
- Collapsible splits

### Block Protocol

Inspect DATEX binary blocks with structured parsing:

- Block header analysis
- Routing header inspection
- Receiver identification
- Encryption and signature metadata

### Network Inspector

Real-time network traffic monitoring:

- Block capture from WebSocket connections
- LocalStorage persistence (up to 200 blocks)
- Filtering and sorting capabilities
- Block metadata extraction

## Development

See other md files for detailed development guidelines, coding conventions, and testing instructions.

---

Use [AGENTS.md](../AGENTS.md) for development/review with LLM. Just copy it into chat, after that your LLM will know everything about project.
