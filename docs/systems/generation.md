# Generation System (The Pipeline)

**Owner**: AI / Backend
**Key Files**: `app/api/generate/`, `services/gemini.ts`, `services/typography.ts`

## Overview
The core product turns a screenshot into a polished marketing asset. It runs in **3 Steps**.

### The Pipeline

1.  **Step 1: Warp** (`api/generate/step1-warp`)
    -   **Input**: Raw screenshot.
    -   **Process**:
        -   Loads template (e.g., `Rotated.png`).
        -   Warps screenshot using **OpenCV** (Perspective Transform).
        -   Masks using HSV Green Screen technique.
        -   Composites using **Sharp**.
    -   **Output**: Warped PNG + `token` (Step 1 signed).

2.  **Step 2: Background** (`api/generate/step2-background`)
    -   **Input**: Prompt + Step 1 Token.
    -   **Process**:
        -   Validates Token (ensures user paid for Step 1).
        -   Calls **Gemini / AI** to generate background texture/image.
        -   Composites Warped Image over Background.
    -   **Output**: Composite PNG + `token` (Step 2 signed).

3.  **Step 2.5: Translation** (`api/translate`)
    -   **Input**: Headline text + Target Language.
    -   **Process**:
        -   Uses **Gemini 2.5 Flash Lite** for fast, marketing-focused translations.
        -   Falls back to Gemini 1.5 Flash/Pro if 2.5 is unavailable.
    -   **Output**: Translated text string.

4.  **Step 3: Text** (`api/generate/step3-text`)
    -   **Input**: Text settings + Step 2 Token.
    -   **Process**:
        -   Validates Token.
        -   Renders text using `text-to-svg` / Sharp.
    -   **Output**: Final Image.

## Security: Signed Tokens
We do not store intermediate state in the database to save writes.
Instead, we pass a **JWT-like signed token** between steps.
-   Contains: `userId`, `transactionId`, `stepNumber`, `imageHash`.
-   Prevents users from skipping steps or reusing old successful steps to bypass payment.

## Troubleshooting
-   **"Edges look jagged"**: Tweak the `cv.dilate` or `cv.GaussianBlur` parameters in Step 1.
-   **"Colors match bezel"**: The Green Screen HSV range might be too wide. Adjust `lowMat`/`highMat` in `step1-warp`.
