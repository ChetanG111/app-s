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
-   `TextView`: Headline input.
-   `TranslateView`: Multi-language selection (English + 4 languages).
-   `FontView`: Font selection.-   `ColorView`: Text color picker.
-   `GenerateView`: Generation trigger + output gallery (displays per-language results).

## Output Gallery
-   **Data Source**: `/api/outputs` returns recent generations.
-   **Language Labels**:
    -   The backend stores the **raw language identifier** (e.g., "english", "french") in the `settings` JSON column of the `Screenshot` record.
    -   The UI reads this directly to display the top-left language pill on the image card.
    -   *Note*: This identifier is the same string used for file generation/naming.


## Editor Logic
Located in `app/dash/page.tsx`.
It orchestrates the **Generation Pipeline** for each selected language:
1.  Loops through `selectedLanguages` array.
2.  For each language: calls `step1-warp` → `step2-background` → (translate if not English) → `step3-text`.
3.  Each language generates one screenshot (1 credit each).
4.  Failures per-language don't stop subsequent languages.

## Design System
-   **Components**: Radix UI primitives (headless) + Tailwind.
-   **Icons**: Lucide React.
-   **Fonts**: Loaded in `layout.tsx` (Inter, etc.).

## Adding a New Template
1.  Add PNG to `public/layouts/`.
2.  Add Coordinates to `lib/data.ts` (`LAYOUT_COORDS`).
3.  Update `VALID_STYLES` in `api/generate/step1-warp`.
