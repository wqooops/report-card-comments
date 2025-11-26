# CLAUDE.md - Project Context

## Project: ReportCardAI.com (Kriterix Engine)

### Core Identity
*   **Name**: ReportCardAI.com
*   **Engine**: Kriterix Engine
*   **Mission**: Save teachers time with high-quality, framework-aligned report card comments.

### Tech Stack
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS v4, Shadcn/UI
*   **AI**: Google Gemini (via Vercel AI SDK)
*   **Language**: TypeScript

### Key Directories
*   `src/app`: Next.js App Router pages and API routes.
*   `src/components`: React components (UI, Home, Layout).
*   `src/lib`: Utility functions.
*   `src/styles`: Global styles (CSS variables, Tailwind config).

### Commands
*   `npm run dev`: Start dev server.
*   `npm run build`: Build for production.
*   `npm run lint`: Run linter.

### Development Guidelines
*   **Design**: Use "Kriterix" brand colors (Blue palette). Clean, modern, SaaS aesthetic.
*   **Code Style**: Functional React components, Hooks, strict TypeScript.
*   **AI Logic**:
    *   Always respect the "Framework" (IB, SPED, ESL).
    *   IB: Inject Learner Profile attributes.
    *   SPED: Asset-based language only.
*   **Security**: Rate limit public APIs. Do not store PII in logs.
