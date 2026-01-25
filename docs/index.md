# Project Documentation

> "Docs follow ownership, not tech."

## 🚀 Start Here
- **Running the app**: [Setup & Environment](./setup.md)
- **Why we built it this way**: [Decisions (ADRs)](./decisions.md)

## 🛠 Systems

### [Frontend System](./systems/frontend.md)
*UI, Editor state, Views.*

### [Generation System](./systems/generation.md)
*The Core Product. OpenCV pipeline, AI generation steps.*

### [Payments System](./systems/payments.md)
*Credits, Dodo Payments, Webhooks.*

### [Auth System](./systems/auth.md)
*NextAuth, Users, Permissions.*

## 📂 Key Directories
- `app/api/generate`: The Generation Pipeline.
- `app/views`: The Editor UI steps.
- `lib/dodo.ts`: Payments client.