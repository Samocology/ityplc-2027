import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";
import { router } from "@/app/router";
import { queryClient } from "./queryClient";
import { AuthProvider } from "@/features/authentication/auth-provider";

/** Single place where application-level providers are composed. */
export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
