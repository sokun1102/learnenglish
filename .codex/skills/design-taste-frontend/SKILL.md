---
name: design-taste-frontend
description: Local anti-slop frontend guidance for IELTS practice UI in this repo. Inspired by Leonxlnx/taste-skill, scoped down for maintainable student/admin product screens.
---

# Design Taste Frontend

Use this skill when creating or redesigning UI in this IELTS practice platform.

Reading this product as: an IELTS study/practice web app for students and admins, with a quiet educational dashboard language, leaning toward Tailwind CSS 4, React Server Components, and restrained motion.

## Defaults

- Framework: Next.js App Router with Server Components by default.
- Styling: Tailwind CSS 4 utilities and CSS variables in `src/app/globals.css`.
- Motion: use `motion/react` only in isolated Client Components when motion improves feedback or orientation.
- Density: medium-high for dashboards and editors; students need scanning, comparison, and repeated practice more than decorative space.

## Visual Direction

- Use calm contrast, clear hierarchy, readable typography, and stable controls.
- Prefer split workspaces for practice screens: content on one side, questions/review/navigation on the other.
- Keep cards for repeated items or contained tools. Do not nest cards inside cards.
- Avoid purple-blue gradient defaults, glass-only layouts, floating decorative blobs, generic three-card marketing sections, and emoji as UI decoration.

## Interaction Direction

- Practice pages should support focused work: timer, question navigator, answer inputs, submit/retry, and review.
- Admin pages should support efficient editing: draft/publish states, preview, validation, media metadata, and answer key management.
- Motion should be subtle: state transitions, hover feedback, review reveal. Avoid long cinematic animation in learning workflows.

## Pre-Flight Check

Before shipping frontend work, verify:

- Text fits on mobile and desktop.
- Interactive controls have visible focus states.
- Dynamic content does not resize critical layout controls.
- Empty/loading/error states exist when data is remote.
- The UI helps a student complete the exercise, not admire the page.

Source inspiration: https://github.com/Leonxlnx/taste-skill
