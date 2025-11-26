# ReportCardAI.com - Kriterix Engine

This is the codebase for **ReportCardAI.com**, powered by the **Kriterix Engine**.

## Project Overview

ReportCardAI.com is a SaaS platform designed to help teachers generate high-quality, framework-aligned report card comments in seconds.

### Key Features

*   **Kriterix Engine**: Our proprietary AI logic fine-tuned for educational frameworks.
*   **Framework Support**:
    *   **IB (MYP/DP)**: Injects Learner Profile attributes.
    *   **SPED / IEP**: Enforces asset-based, observable language.
    *   **ESL / ELL**: Focuses on language acquisition stages.
    *   **General / Common Core**: Professional and constructive comments.
*   **Free Generator**: A public-facing tool on the homepage for quick trials.

## Tech Stack

*   **Frontend**: Next.js 14 (App Router), Tailwind CSS v4, Shadcn/UI.
*   **Backend**: Next.js API Routes.
*   **AI**: Google Gemini API via Vercel AI SDK.
*   **Database**: (Planned) PostgreSQL / Supabase.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Set up environment variables**:
    Create a `.env.local` file and add your Google Gemini API key:
    ```env
    GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Build for production**:
    ```bash
    npm run build
    ```

## API Documentation

### `POST /api/generate-comment`

Generates a report card comment.

**Request Body:**

```json
{
  "studentName": "Alex",
  "framework": "IB (MYP/DP)",
  "strength": "Critical thinking in history",
  "weakness": "Time management",
  "tone": "Professional"
}
```

**Rate Limiting:**
The public API is rate-limited to 10 requests per hour per IP address.
