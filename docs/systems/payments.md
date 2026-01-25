# Payments System

**Owner**: Backend / Business
**Key Files**: `lib/dodo.ts`, `app/api/webhooks/dodo/`, `data/credits.json`

## Concept: Credits
We abstract money into **Credits**.
- 1 Generation = 1 Credit.
- Users buy bundles of credits.
- `User.credits` integer field tracks balance.

## Transaction Flow (Purchase)

1.  **Checkout**: User selects a plan. `app/api/create-checkout/`.
2.  **Provider**: **Dodo Payments**.
3.  **Fulfillment**:
    -   Webhook: `POST /api/webhooks/dodo`.
    -   Event: `payment.succeeded`.
    -   **Security**: We verify the payment ID with Dodo API before trusting the webhook.
    -   **Action**: Increment `User.credits`, record `Purchase`.

## Transaction Flow (Usage)

We use a **Optimistic Deduction** strategy with reliable rollback.

1.  **Request**: User asks to generate.
2.  **Deduct**: Database transaction decrements 1 credit.
    -   *Constraint*: If `credits < 1`, throw error.
3.  **Generate**: Perform the work.
4.  **Fail?**: If generation crashes, we **Refund** the credit (Increment +1).

> **See ADR-002** for why we deduct first.

## Debugging

-   **"User paid but no credits?"**
    -   Check Dodo Dashboard for the payment status.
    -   Check Vercel Logs for `Webhook Error` or `Verification failed`.
    -   Did the webhook reach the server? (Localhost issues).

-   **"User lost a credit on error?"**
    -   Check `prisma.creditTransaction` table.
    -   Look for `status: PENDING` that never turned to `FAILED` or `COMPLETED`.
    -   Run the `refund-pending` cron job (if implemented) or manually refund.
