"use client"

import InterviewApp from "@/components/Interview";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <InterviewApp />
    </QueryClientProvider>
  );
}
