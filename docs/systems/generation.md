# Generation System (The Pipeline)

**Owner**: AI / Backend
**Key Files**: `app/api/generate/`, `services/gemini.ts`, `services/typography.ts`

## Overview
The core product turns a screenshot into a polished marketing asset. It runs in **3 Steps**.

## Pipeline Architecture
The generation process is split into reusable stages to optimize cost and performance for multi-language batches.

### Step 1: Warp & Credit Reservation
`POST /api/generate/step1-warp`
- **Input**: Screenshot, Style, `creditCost` (Wait N).
- **Process**:
    - Deducts **N credits** from user balance.
    - Creates a `PENDING` transaction with `metadata.allowedImages = N`.
    - Generates the warped overlay (green-screened).
    - Signs a JWT token containing `transactionId` and result hash.
- **Output**: Warped image, Token.

### Step 2: Background (Reused)
`POST /api/generate/step2-background`
- **Input**: Warped Image, Background Prompt, Token.
- **Process**:
    - Verifies Token.
    - Uses Google Gemini (Imagen) to generate the background *once*.
    - Signs a new Token authorizing Step 3.
- **Output**: Composite Image (No Text), Token.

### Step 3: Text Overlay & Finalize (Parallel)
`POST /api/generate/step3-text`
- **Input**: Composite Image, Headline, Font/Color, Language, Token.
- **Process**:
    - **Atomic Limit Check**: Locks `CreditTransaction` row and increments `metadata.generatedCount`. Rejects if limit exceeded.
    - Adds text overlay (Sharp).
    - Uploads to Supabase.
    - Creates `Screenshot` record (stores `language` ID in settings, which powers the UI label).
    - Marks Transaction `COMPLETED` (idempotent).
- **Output**: Final Public URL.

## Concurrency & Security
- **Parallelism**: The frontend executes Step 3 in parallel (`Promise.all`) for all selected languages.
- **Safety**:
    - **Step 1/2** run serially once (Single Source of Truth).
    - **Step 3** is race-proof due to atomic DB row locking on the transaction metadata.
    - **Refunds**: Only Step 1/2 failures trigger a full refund. Step 3 failures must be retried manually (no auto-refunds avoids exploit risks).

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
