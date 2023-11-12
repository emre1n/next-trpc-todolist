import { httpBatchLink } from '@trpc/client';

import { appRouter } from '@/server/api/root';

export const serverClient = appRouter.createCaller({
  links: [
    httpBatchLink({
      url: 'http://localhost:3002/api/trpc',
    }),
  ],
});
