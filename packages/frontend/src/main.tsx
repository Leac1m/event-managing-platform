import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';
import App from './App.tsx';
import './index.css';

function Root() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/trpc',
          fetch: async (input, init) => {
            const response = await fetch(input, init as RequestInit);
            if (response.status === 401) {
              try {
                localStorage.removeItem('token');
              } catch (e) {
                /* ignore */
              }
              window.location.href = '/login';
              throw new Error('Unauthorized');
            }
            return response;
          },
          headers: () => {
            const token = localStorage.getItem('token');
            return {
              authorization: token ? `Bearer ${token}` : '',
            };
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
