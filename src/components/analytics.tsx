import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackPageview } from "@/lib/analytics";

/** Envoie une page_view à chaque changement de route (SPA). */
export function Analytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });

  useEffect(() => {
    const path = `${pathname}${search || ""}`;
    trackPageview(path);
  }, [pathname, search]);

  return null;
}
