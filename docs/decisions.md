# Architectural Decision Records (ADR)

> "We chose X over Y because Z."

## ADR-001: OpenCV Wasm for Image Processing

### Context
We need to warp user screenshots onto 3D-rotated device templates. CSS 3D transforms are insufficient for high-quality exportable images (HTML5 Canvas is flaky with high-res exports).

### Decision
Use `opencv-wasm` on the backend (Next.js API Routes).

### Consequences
- **Good**: Pixel-perfect perspective warps.
- **Good**: "Green screen" masking technique allows dynamic templates without complex alpha masks.
- **Bad**: Heavy dependency (WASM binary).
- **Bad**: Synchronous loading can be tricky in Serverless/Edge environments (currently pinned to Node.js runtime).

## ADR-002: "Deduct-First" Credit Model

### Context
Generating images is expensive (compute & API costs). We need to prevent users from spamming the API and exhausting resources before paying.

### Decision
Deduct 1 credit **before** starting the generation process. Refund if it fails.

### Consequences
- **Good**: Prevents "infinite retry" abuse.
- **Good**: Simplifies checking "can user afford this?".
- **Bad**: Requires robust error handling to ensure refunds happen (used `prisma.$transaction` and `try/catch/finally` blocks).
- **Bad**: Race conditions could theoretically lose a credit if the server dies *hard* after deduction but before result (accepted risk for now).

## ADR-003: Step-Based Generation Pipeline

### Context
Image generation involves multiple independent operations: Warping, Background generation (AI), and Text overlay. Doing all in one request is slow and prone to timeouts.

### Decision
Split generation into strict Steps: `Step 1 (Warp)` -> `Step 2 (Background)` -> `Step 3 (Text)`.
Pass state via **Signed Tokens**.

### Consequences
- **Good**: Better UX (progress bars, intermediate results).
- **Good**: Easier to debug specific failures.
- **Good**: Rate limiting can be applied per-step.
- **Bad**: More complex frontend state management.

## ADR-004: Progress UI Simplification

### Context
The backend pipeline follows a strict multi-step process (Warp -> Background -> Translate -> Text -> Verify). Displaying every granular step to the user caused a "jumping" progress bar experience and cognitive overload.

### Decision
Collapse internal states into 3 visual phases: `Creating Overlay` -> `Background Generation` -> `Adding Text`.
Translation and Verification are visually merged into the "Text" phase.

### Consequences
- **Good**: Smoother, less jittery progress bar.
- **Good**: "Background Generation" (the longest step) gets its own distinct phase, managing wait expectations.
- **Bad**: Slight mismatch between logs and UI text (mitigated by fuzzy matching in frontend logic).
