import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function withQueryClient(ui: React.ReactElement) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

export const queryClientWrapper = ({ children }: { children: React.ReactNode }) => {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
