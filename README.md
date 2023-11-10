This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

## Setting up tRPC

[tRPC Set up with Next.js](https://trpc.io/docs/client/nextjs/setup)

More info on [React Query Integration](https://trpc.io/docs/client/react)

- Install required packages

```bash
pnpm add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query@^4.0.0 zod
```

### Enable strict mode

If you want to use Zod for input validation, make sure you have enabled strict mode in your `tsconfig.json`:

```json
"compilerOptions": {
+   "strict": true
}
```

- Create `trpc.ts` file inside `server` directory at the root level

### Create a tRPC router

Initialize your tRPC backend in `server/trpc.ts` using the initTRPC function, and create your first router.

```ts
import { initTRPC } from '@trpc/server';

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create();

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
```
