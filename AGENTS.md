# AGENTS.md

Repository instructions for coding agents working on this IELTS practice platform.

## Product Context

This app is a Next.js IELTS practice workspace for students and admins:

- Students practice IELTS Reading and Listening.
- Reading includes gap-fill/cloze questions rendered from stable placeholders such as `{{blank_1}}`.
- Listening stores audio metadata in the database and should serve heavy files from MinIO/S3-compatible object storage.
- Admins create tests, answer keys, explanations, and media references.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Motion via `motion/react` for new motion work
- MongoDB with Mongoose
- MinIO/S3-compatible storage for audio and other heavy media

## Next.js Rules

- Use App Router conventions under `src/app`.
- Prefer Server Components by default.
- Add `"use client"` only for interactive leaves with state, events, browser APIs, or Motion.
- For version-specific Next.js behavior, read the bundled docs in `node_modules/next/dist/docs` before relying on memory.
- In Next.js 16 dynamic route props may be async. Await `params` and `searchParams` where required.
- Keep API/database code server-only. Do not import Mongoose models into Client Components.

## UI Rules

- This is a study/practice product, not a marketing landing page.
- Favor dense, calm, scannable interfaces: toolbars, split panes, tables/lists, answer review panels, and clear status states.
- Avoid generic AI visual defaults: purple gradients, oversized centered heroes, decorative blobs, emoji-heavy UI, nested cards.
- Use stable dimensions for test workspaces, answer inputs, question navigation, and audio controls to avoid layout shift.
- Keep visible copy useful to students/admins. Do not fill the app with explanations of how the UI works.

## Data Rules

- Store test content as structured documents: tests, sections, questionGroups, questions, attempts, mediaAssets.
- Store uploaded files in object storage. Database records should keep only metadata such as bucket, objectKey, mimeType, size, duration, and provider.
- Keep scoring logic in pure TypeScript modules so it can be tested independently of React and MongoDB.
- Normalize short-answer scoring carefully: trim whitespace, collapse repeated spaces, optionally lowercase, check word limits, support alternative answers.

## Verification

Run these before finishing meaningful code changes:

```bash
npm run typecheck
npm run build
```

Run lint when editing broader app code:

```bash
npm run lint
```
