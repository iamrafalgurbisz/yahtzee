import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { isUnauthorized } from "./api";
import { QUERY_KEYS } from "./queryKeys";

function handleError(error: unknown) {
  if (isUnauthorized(error)) {
    queryClient.setQueryData(QUERY_KEYS.me(), null);
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleError }),
  mutationCache: new MutationCache({ onError: handleError }),
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: (count, error) => !isUnauthorized(error) && count < 2,
    },
  },
});
