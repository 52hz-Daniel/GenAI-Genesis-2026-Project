# Sector 2: Design system

Design tokens (colors, spacing, typography), icons, and brand constants. Single source of truth for look and feel.

- **Owner:** Agent 2 (UX, UI & design system)
- **Do not edit from:** Agent 1, 3, 4

## Files

- **`tokens.css`** — CSS custom properties used by `app/globals.css` and Tailwind:
  - **Colors:** `--background`, `--foreground`, `--muted`, `--muted-bg`, `--card`, `--surface-elevated`, `--border`, `--accent`, `--accent-soft`, `--accent-hover`, `--success`, `--success-soft` (light + dark)
  - **Radii:** `--radius-sm`, `--radius`, `--radius-lg`
  - **Spacing:** `--space-1` through `--space-16` (4px base scale)
  - **Typography:** `--text-xs` … `--text-5xl`, `--font-normal` … `--font-bold`
  - **Shadows:** `--shadow-sm`, `--shadow`, `--shadow-md`, `--shadow-lg`

## Brand voice

Supportive, precise, student-first. Accent (sky blue) conveys clarity and approachability; surfaces are clean and low-clutter.

## Usage

Other sectors import design-system components or use Tailwind classes that reference these tokens (e.g. `bg-accent`, `rounded-lg`, `shadow-md`, `font-display`). Do not redefine colors or spacing in component files; use the design system.

- **Display font:** Use `font-display` for hero and section headings (Source Serif 4). Body remains Geist.
- **Motion:** Use `animate-in` for subtle entrance (fade-in-up). Respects `prefers-reduced-motion`.
