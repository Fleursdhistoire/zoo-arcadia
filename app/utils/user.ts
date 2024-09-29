import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

interface User {
  id: number;
  email: string;
  role: string;
}

interface RootLoaderData {
  user: User | null;
}

export function useOptionalUser(): User | undefined {
  const matches = useMatches();
  const rootLoaderData = matches.find((match) => match.id === "root")?.data as RootLoaderData | undefined;

  return useMemo(() => {
    if (!rootLoaderData || !rootLoaderData.user) {
      return undefined;
    }

    return rootLoaderData.user;
  }, [rootLoaderData]);
}