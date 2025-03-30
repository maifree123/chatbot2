'use client'

import { QueryClient } from "@tanstack/react-query"

import { QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

function App({ children }: { children: React.ReactNode }) {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default App