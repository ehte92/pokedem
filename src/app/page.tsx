"use client";

import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Welcome to the Pokémon App
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Explore the world of Pokémon and build your own Pokédex!
        </p>
      </div>
    </QueryClientProvider>
  );
}
