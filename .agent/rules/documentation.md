---
trigger: always_on
glob: "**/*"
description: "Rules for interacting with project documentation"
---

# Documentation Rules

You are working in a project that values high-quality, up-to-date documentation.

## 1. Context First
Before starting any significant task, **read `docs/index.md`**.
- Follow the links to the relevant system docs (e.g., `docs/systems/payments.md` if working on billing).
- This is your source of truth for architecture and "why" things work the way they do.

## 2. Question Decisions
If you encounter code or patterns that seem counter-intuitive:
- Check `docs/decisions.md` (ADRs) first.
- If it's not there, **ask the user** about the reasoning.
- *Bonus*: Offer to record the answer in `decisions.md` so the next agent doesn't have to ask.

## 3. Update Docs Before Committing
**After** you have implemented changes and **Received User Approval**, but **Before** you commit:
- Review the changes. Do they impact the existing documentation?
    - Did you add a new Env Var? -> Update `docs/setup.md`.
    - Did you change the Payment Flow? -> Update `docs/systems/payments.md`.
    - Did you add a new View? -> Update `docs/systems/frontend.md`.
- **Instruction**: "I will now update the relevant documentation to reflect these changes."

## 4. Format
- Keep it concise.
- Use `Future-You` style: Write for a frustrated developer who needs answers fast.
- No essays. Bullet points and links are preferred.