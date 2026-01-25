# Frontend System

**Owner**: Frontend Team
**Key Files**: `app/dash/`, `views/`, `components/`

## Architecture
-   **Framework**: Next.js 15 App Router.
-   **Styling**: Tailwind CSS.
-   **State**: Local React State (mostly) + URL Params (for sharing, potentially).

## View System (`views/`)
The editor is a wizard. We explicitly separate logic into "Views":
-   `UploadView`: Drag & Drop screenshot.
-   `StyleView`: Choose device template (Basic, Rotated).
-   `BackgroundView`: AI Prompting.
-   `TextView`: Typography controls.

## Editor Logic
Located in `app/dash/page.tsx` (or `GenerateView.tsx`).
It orchestrates the **Generation Pipeline**:
1.  Calls `step1-warp`.
2.  Received `image` + `token`.
3.  Calls `step2-background` with `token`.
4.  ...

## Design System
-   **Components**: Radix UI primitives (headless) + Tailwind.
-   **Icons**: Lucide React.
-   **Fonts**: Loaded in `layout.tsx` (Inter, etc.).

## Adding a New Template
1.  Add PNG to `public/layouts/`.
2.  Add Coordinates to `lib/data.ts` (`LAYOUT_COORDS`).
3.  Update `VALID_STYLES` in `api/generate/step1-warp`.
