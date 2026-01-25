# Authentication System

**Owner**: Backend Team
**Key Files**: `auth.ts`, `middleware.ts`, `app/api/auth/`

## Philosophy
We use **NextAuth v5 (Beta)**. We support:
1.  **Google**: Low friction.
2.  **Email/Password**: For those who prefer it.

## Flows

### Sign Up / Welcome
- **Trigger**: `events.createUser` in `auth.ts`.
- **Action**:
    1.  Grants **3 Free Credits**.
    2.  Sends **Slack Notification** to the team.
- **Why**: immediate value for new users, visibility for us.

### Middleware
- `middleware.ts` enforces auth on protected routes (dashboard, generation).
- Uses `authConfig` (Edge compatible) to check session tokens without hitting the DB if possible.

## Database Models
- `User`: The core identity.
- `Account`: OAuth linkage (Google).
- `Session`: Database sessions (if not using JWT strategy, but we default to JWT in `authConfig` usually, check config).

> **Note**: We use `bcrypt` for password hashing. This forces the Credentials provider to run in Node.js runtime, not Edge.
