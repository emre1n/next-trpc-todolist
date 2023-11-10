# Next 13 App Router tRPC implementation

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
export const publicProcedure = t.procedure;
```

- Initialize an instance of the the `router` inside the `index.ts` file in the `server` directory

- Make the `getTodos` router/function and create a procedure on it

```ts
import { publicProcedure, router } from './trpc';

export const appRouter = router({
  getTodos: publicProcedure.query(async () => {
    return [10, 20, 30];
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
```

- Connect the router into the App Router itself
- Create a route inside of the app directory, that's going to route requests to that tRPC instance

- Create `route.ts` inside `app/api/[trpc]`

- This is the big difference between `Pages Router` and `App Router` implementation
- In the `Pages Router` there is an already setup adapter

- For the `App Router` `fetch adapter` should be used

```ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '@/server';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
```
