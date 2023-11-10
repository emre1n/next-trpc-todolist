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

### Making the request using React Query from the client

[Set up the React Query Integration](https://trpc.io/docs/client/react/setup)

- Create a tRPC client
- Inside `app` directory create a directory `_trpc` and within that directory create `client.ts`

Note: Any directory starts with `_` is ignored by `App Router` in terms of routing

- Create tRPC React Client

- Get `AppRouter` types from the `server`
(Create a set of strongly-typed React hooks from your AppRouter type signature with createTRPCReact.)

```ts
import { createTRPCReact } from '@trpc/react-query';

import { type AppRouter } from '@/server';

export const trpc = createTRPCReact<AppRouter>({});

```

- getTodos type is comming from the server to the client
- This is how routing all type from server code to client code

```ts
(alias) type AppRouter = Router<RouterDef<RootConfig<{
    ctx: object;
    meta: object;
    errorShape: DefaultErrorShape;
    transformer: DefaultDataTransformer;
}>, {
    getTodos: BuildProcedure<...>;
}, {
    ...;
}>> & {
    getTodos: BuildProcedure<...>;
}
import AppRouter
```

- React Query needs a provider, there is a need to create a query client  `QueryClient` as well as provider client `QueryClientProvider`

### Create a Provider

- Create `Provider.tsx` in `_trpc` directory

- Create React `QueryClient`

```tsx
const [queryClient] = useState(() => new QueryClient());
```

- And `trpcClient`

```tsx
const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',

          // You can pass any HTTP headers you wish here
          async headers() {
            return {
              authorization: getAuthCookie(),
            };
          },
        }),
      ],
    }),
  );
```

- And return `QueryClientProvider`

```tsx
return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
```

- `Provider.tsx` looks like this

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
import { trpc } from './client';

export default function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3002/api/trpc',

          // You can pass any HTTP headers you wish here
          //   async headers() {
          //     return {
          //       authorization: getAuthCookie(),
          //     };
          //   },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

### User Provider in the `layout.tsx`

- Bring in `Provider` and wrap `children`

```tsx
import Provider from './_trpc/Provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
```

### Create a TodoList Client Component

- Create `_components` directory in the `app` directory and within create `TodoList.tsx`

- Make the request to get todos

- `getTodos` function is already on `trpc` client as well as `useQuery` from React Query Provider

```tsx
'use client';

import { trpc } from '../_trpc/client';

export default function TodoList() {
  const getTodos = trpc.getTodos.useQuery();

  return (
    <div>
      <div>{JSON.stringify(getTodos.data)}</div>
    </div>
  );
}
```

- Now bring the client component to the page
