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

Reference: [Hosting tRPC with Adapters - Route Handlers](https://trpc.io/docs/server/adapters/nextjs)

"If you're trying out the Next.js App Router and want to use route handlers, you can do so by using the fetch adapter, as they build on web standard Request and Response objects:"

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
          url: 'http://localhost:3000/api/trpc',

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

### Setup Prisma

```bash
pnpx prisma --save-dev
```

```bash
pnpx prisma init
```

- Update the `DATABASE_URL` inside `.env` file with the development database

- Add `Todo` model to the `schema.prisma`

```prisma
model Todo {
  id      Int      @id @default(autoincrement())
  content String?
  done    Boolean?
}
```

### Refactor tRPC server

- Create an `api` directory inside `server` directory
- Move `trpc.ts` into `api` directory
- Create `routers` directory inside `api` directory
- Move `index.ts` file which has `appRouter` to `routers` directory and rename it as `todo.ts`
- Create `root.ts` inside `api` directory

tRPC Server Folder Structure

```text
server
  ├─ api
  |   └─ routers
  |   |       └─ todo.ts
  |   └─ root.ts
  |   └─ trpc.ts
```

```ts
import { router } from './trpc';
import { todoRouter } from './routers/todo';

export const appRouter = router({
  todo: todoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
```

- Refactor `app.ts` (where appRouter and getTodos method created) rename `app.ts` to `todo.ts`

```ts
import { publicProcedure, router } from '../trpc';

export const todoRouter = router({
  getTodos: publicProcedure.query(async () => {
    return [10, 20, 30, 40, 50, 60];
  }),
});
```

- Update `route.ts` inside `app/trpc/[trpc]` and `client.ts` inside `app/_trpc` import, direct it to root.ts

- Update `TodoList.tsx` component
- Add `todo` router after `trpc` client

```tsx
  const getTodos = trpc.todo.getTodos.useQuery();
```

## Install Prisma Client

```bash
pnpm install @prisma/client
```

Whenever you update your Prisma schema, you will have to update your database schema using either `prisma migrate dev` or `prisma db push`. This will keep your database schema in sync with your Prisma schema. The commands will also regenerate Prisma Client.

- Instantiate Prisma Client (Singleton)
- Create `db.ts` inside `server` directory

[Best practice for instantiating PrismaClient with Next.js](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices#solution)

```ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const db = globalForPrisma.prisma ?? prismaClientSingleton()

export default db

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- Inside `todo` router, connect prisma client

```ts
import prisma from '@/server/db';
import { publicProcedure, router } from '../trpc';

export const todoRouter = router({
  getTodos: publicProcedure.query(async () => {
    return db.todo.findMany();
  }),
});
```

- Add `createTodo` method

```ts
import db from '@/server/db';
import { publicProcedure, router } from '../trpc';

import { z } from 'zod';

export const todoRouter = router({
  getTodos: publicProcedure.query(async () => {
    return await db.todo.findMany();
  }),
  addTodo: publicProcedure.input(z.string()).mutation(async opts => {
    return await db.todo.create({ data: { content: opts.input, done: false } });
  }),
});
```

- Connect it to `TodoList` component
- Code the UI

- Bring in `addTodo` function add `onSettled` property to refetch after adding the new todo to database

```tsx
  const addTodo = trpc.todo.addTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });
```

- On button click, send the content of the `content` context via mutate method `addTodo.mutate(content);`

```tsx
        <button
          className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
          onClick={async () => {
            if (content.length) {
              addTodo.mutate(content);
              setContent('');
            }
          }}
        >
          Add Todo
        </button>
```

- Create `setDone` Procedure inside `todo` router

```ts
setDone: publicProcedure
    .input(
      z.object({
        id: z.number(),
        done: z.boolean(),
      })
    )
    .mutation(async opts => {
      const { id, done } = opts.input;

      return await db.todo.update({
        where: { id },
        data: { done },
      });
    }),
```

- Connect it to `TodoList` component

### Server Side Calls / SSR Support

[Server Side Calls](https://trpc.io/docs/server/server-side-calls#create-caller)

- Create `serverClient.ts` inside `_trpc` directory of `app`
- Inside the `serverClient.ts` use `createCaller` function

- Go to `page.tsx` Home Page
- Bring in the `serverClient`
- Make the page function `async`

- Get the `todos`, since it returns a `promise`, `await` it

```tsx
const todos = await serverClient.todo.getTodos();
```

- `todos` are totally type-safe

```ts
const todos: {
    id: number;
    content: string | null;
    done: boolean | null;
}[]
```

- Pass the `todos` to `TodoList` component as `initialTodos`
- Add the `initialTodos` prop to `TodoList` component
- Bring the type of `initialTodos` from `serverClient` `getTodos` procedure

- Because `serverClient` returns a Promise, it should be `Awaited` typing

```tsx
export default function TodoList({
  initialTodos,
}: {
  initialTodos: Awaited<ReturnType<(typeof serverClient)['todo']['getTodos']>>;
}) {
  // Rest of the component
}
  ```

- Send the `intialTodos` to `useQuery` of `getTodos`

```tsx
  const getTodos = trpc.todo.getTodos.useQuery(undefined, {
    initialData: initialTodos,
  });
```

[Using `initialData` to prepopulate a query](https://tanstack.com/query/v4/docs/react/guides/initial-query-data#using-initialdata-to-prepopulate-a-query)

- To avoid making the initial call on the client (When mounted) after SSR
- Add `refetchOnMount` and `refetchOnReconnect` to `useQuery` and set them `false`

```tsx
  const getTodos = trpc.todo.getTodos.useQuery(undefined, {
    initialData: initialTodos,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
```

Note: For the alternative `drizzle` setup switch to `alternative-drizzle-implementatio` branch
