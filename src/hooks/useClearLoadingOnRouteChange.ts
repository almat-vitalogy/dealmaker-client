// hooks/useClearLoadingOnRouteChange.ts
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNavigationStore } from "@/store/navigation";

export function useClearLoadingOnRouteChange() {
  const pathname = usePathname();
  const { setLoadingToPath } = useNavigationStore();

  useEffect(() => {
    setLoadingToPath(null); // Clear loading after route change
  }, [pathname, setLoadingToPath]);
}
