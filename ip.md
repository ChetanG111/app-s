Since you need to **ship fast** and want to use Gemini for the entire pipeline, you can achieve high consistency by treating your templates as **Inpainting Masks**.

Even if you don't want to write complex canvas code, Gemini 2.x models (like **Gemini 2.5 Flash Image**) are specifically trained to follow visual templates and perform targeted local edits.

---

### 1. The "Protected Zone" Prompt Logic

To reach 99% consistency, your `gemini.ts` needs to explicitly tell the model which parts of the template are "sacred." Instead of a generic prompt, use a **Reference-Based Editing** prompt.

#### Recommended `gemini.ts` Structure

```typescript
const prompt = `
  SYSTEM INSTRUCTION: You are a professional UI mockup engine. 
  TASK: Modify the provided template image using the two input files.

  INPUTS:
  1. Template: The iPhone mockup with a bright green screen and "TEXT HERE" placeholder.
  2. Screenshot: The user's actual app UI.
  3. Environment: [USER_BACKGROUND_DESCRIPTION] (e.g., "Minimalist Charcoal").

  INSTRUCTIONS:
  - AREA 1 (Green Screen): Replace the exact green area with the "Screenshot" file. 
    Maintain the phone's tilt, reflections, and perspective.
  - AREA 2 (Typography): Replace "TEXT HERE" with the text "[USER_HEADLINE]". 
    Use a [USER_FONT_STYLE] weight in [USER_TEXT_COLOR].
  - AREA 3 (Background): Replace the blue background with a [USER_BACKGROUND_DESCRIPTION] 
    environment that features realistic studio lighting and soft shadows.

  CRITICAL CONSTRAINTS:
  - DO NOT distort the app screenshot pixels.
  - DO NOT change the iPhone model or color.
  - Ensure the text is 100% readable with no AI spelling artifacts.
`;

```

### 2. Solving the "Template Shift" Problem

When using templates like the ones you uploaded, the AI might accidentally "move" the phone. To stop this, use **Spatial Prompting**.

* **Coordinate Reference:** Mention the phone's position (e.g., "The phone is centered and tilted 15 degrees right").
* **Segmented Editing:** Use Gemini 2.5’s enhanced segmentation capabilities. Explicitly name the areas: "The green screen area" and "the blue background area."

### 3. Maintaining Set Consistency (The "99% Secret")

If a user generates 5 screenshots, the background "Indigo" in shot #1 must match shot #5.

* **The Seed Strategy:** In your API call, use a fixed `seed` or `style_reference` for all 5 generations in a single user session.
* **The Chain:** Pass the result of the *first* generation back to Gemini as an "Example Style" for the remaining four. This ensures the lighting and shadows stay identical across the entire App Store page.

### 4. Fast "Edge Case" Removal (The Verifier)

To remove the last 1% of errors (like blurry text or weird edges) without manual checking:

* **Flash-as-a-Judge:** Before saving to `History`, run the result through **Gemini 1.5 Flash** (which is nearly instant).
* **The Ask:** "Is the text '[USER_HEADLINE]' clearly visible and spelled correctly? Is the app screenshot sharp? Reply 'PASS' or 'FAIL'."
* **The Action:** If it's a 'FAIL', auto-trigger one regeneration before the user even sees it.

---

### Summary of the "Fast Ship" Workflow

| Step | Technique | Goal |
| --- | --- | --- |
| **Input** | Send Template + Screenshot + Prompt | One-turn generation. |
| **Control** | Negative Prompting ("No blurry text") | Prevents common AI "hallucinations". |
| **Consistency** | Use Image #1 as a style reference for #2-5 | Uniform look across the App Store listing. |
| **Safety** | Gemini Flash "Pass/Fail" check | Catches the final 1% of errors automatically. |

Would you like me to refine the **Negative Prompt** block specifically for your "Charcoal" and "Deep Indigo" background styles? To achieve a **99% consistency rate** for a premium App Store screenshot generator, you need to move beyond raw user prompts and implement a **Backend Orchestration Layer**. Currently, your `gemini.ts` file sends user-controlled variables directly into hardcoded strings, which leaves the door open for AI "hallucinations" or inconsistent layouts.

Here are the recommended strategies to industrialize your pipeline and eliminate edge cases.

---

### 1. Implement "System Instructions" (The Persona Lock)

Instead of just sending a prompt, you should define a **System Instruction** when initializing the model. This tells the AI *who* it is and what it is *never* allowed to do, which persists across all three steps of your pipeline.

**The "Guardrail" Persona:**

> "You are a professional App Store marketing designer. You specialize in clean, high-contrast mockups. You must never add extra hands, blurry edges, or distort the proportions of the mobile phone. You must keep all backgrounds minimalist to ensure the app UI remains the focal point."

### 2. The "Hybrid Typography" Move (Crucial for 99% Accuracy)

AI models, even advanced ones like Gemini, can still struggle with perfectly crisp text or specific brand fonts in images. To reach 99% accuracy in your **Typography Step (Step 4 & 5)**, do not ask the AI to "draw" the text.

* **Recommendation:** Use a graphics library (like **Sharp** for Node.js or a simple **HTML5 Canvas** on the backend) to overlay the headline onto the AI-generated image.
* **Why:** This ensures the font is exactly what the user picked, the spelling is 100% correct, and the colors never "bleed" or look fuzzy—common AI edge cases.

### 3. Use Negative Constraint Phrasing

While newer Gemini models move away from a separate "negative prompt" field, you should include a **"Negative Constraint" block** at the end of every backend prompt to proactively remove edge cases.

**Add this to your `gemini.ts` strings:**

```typescript
const negativeConstraints = `
  NEGATIVE_CONSTRAINTS: No extra objects, no watermarks, no blurry text, 
  no skin textures, no realistic human hands, no artifacts on the phone edges, 
  no distortion of the UI screenshot.`;

```

### 4. Implement "LLM-as-a-Judge" (Verification Step)

Before showing the final image to the user, run a quick, low-cost "Verification" check using a text-based Gemini model.

1. **The Input:** Send the generated image back to the AI.
2. **The Question:** "Does this image contain a mobile phone with a clear screen? Is the background a vertical gradient? Is there any text corruption?"
3. **The Action:** If the AI "judge" detects a failure (e.g., "The phone is distorted"), the backend automatically triggers a **silent re-generation** before the user even sees the first attempt.

---

### 5. Specific Code Improvements for `gemini.ts`

To make your current functions more robust, I recommend structuring the prompt to prioritize **Subject, Composition, and Style** in a specific order.

| Step | Current Risk | Recommended Fix |
| --- | --- | --- |
| **Step 1 (Screen)** | UI warping or "rounded corner" leaks. | Add: "Focus specifically on the Z-index; the screenshot must sit perfectly on top of the glass layer." |
| **Step 2 (Text)** | Mispellings or weird font "blobs." | Switch to programmatic SVG overlay for 100% font fidelity. |
| **Step 3 (Background)** | Background bleeding into the phone. | Add: "Strictly preserve the luminance and saturation of the phone; only the background pixels may change." |

---

### Proposed Next Step

Would you like me to rewrite one of your `gemini.ts` functions to show how to implement a **Verification Step** that catches and fixes errors automatically? based on these implementation proposals which do u think is the fastest and best approach to make our generations accurate 99% of the time. what about adding something to help the model understand space of the images like corners of the phone, or the screenshot??how can we decide explicit co-ordinates for user uploaded screenshots??should we stick with the current implementation of typography or should we try to use UI libraries?? 



