"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTvNavigation } from "@/hooks/useTvNavigation";

interface TvNavigationProviderProps {
  children: ReactNode;
}

export function TvNavigationProvider({
  children,
}: TvNavigationProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { refresh } = useTvNavigation({
    enableArrowKeys: true,
    enableNumberKeys: false,
    onEscape: () => {
      try {
        router.back();
      } catch {
        // If no history, do nothing
      }
    },
    onEnter: (element) => {
      const tag = element.tagName.toLowerCase();
      const role = (element.getAttribute("role") || "").toLowerCase();
      const clickable = tag === "a" || tag === "button" || role === "button" || role === "link" || role === "row" || role === "option";
      if (clickable || (element as HTMLElement).hasAttribute("onclick")) {
        (element as HTMLElement).click();
      }
    },
  });

  // Re-scan and refocus on route change
  useEffect(() => {
    const timeout = setTimeout(() => {
      refresh();

      const elements = document.querySelectorAll<
        HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement | HTMLAnchorElement
      >(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );

      if (elements.length > 0) {
        const firstFocusable = elements[0] as HTMLElement;
        firstFocusable.focus();
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [pathname, refresh]);

  // Handle focus changes for TV navigation
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.tagName) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

  return <>{children}</>;
}
