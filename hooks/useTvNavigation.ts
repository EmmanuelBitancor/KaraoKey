"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type FocusableElement = HTMLElement;

type NavigationDirection = "up" | "down" | "left" | "right" | "home" | "end" | "tab" | "escape";

interface TvNavigationOptions {
  initialFocus?: string;
  onFocusChange?: (element: FocusableElement | null) => void;
  onEnter?: (element: FocusableElement) => void;
  onEscape?: () => void;
  enableArrowKeys?: boolean;
  enableNumberKeys?: boolean;
  container?: HTMLElement | null;
}

interface TvNavigationResult {
  focusedElement: FocusableElement | null;
  setFocus: (element: FocusableElement | string) => void;
  getFocusableElements: () => FocusableElement[];
  refresh: () => void;
}

function isElementTopMost(element: FocusableElement): boolean {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const topElement = document.elementFromPoint(centerX, centerY) as HTMLElement | null;

  if (!topElement) return false;

  // Check if the element or one of its ancestors is the topmost element
  let current: HTMLElement | null = topElement;
  while (current) {
    if (current === element) return true;
    current = current.parentElement;
  }

  return false;
}

export function useTvNavigation(options: TvNavigationOptions = {}): TvNavigationResult {
  const {
    initialFocus,
    onFocusChange,
    onEnter,
    onEscape,
    enableArrowKeys = true,
    enableNumberKeys = false,
    container = typeof window !== "undefined" ? document.body : null,
  } = options;

  const [focusedElement, setFocusedElement] = useState<FocusableElement | null>(null);
  const focusedElementRef = useRef<FocusableElement | null>(null);
  const isActiveRef = useRef(false);
  const focusableElementsRef = useRef<FocusableElement[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);

  const updateFocusableElements = useCallback(() => {
    if (!container) return [];

    const elements: FocusableElement[] = [];

    const collectElements = (parent: HTMLElement) => {
      const candidates = parent.querySelectorAll<
        | HTMLInputElement
        | HTMLButtonElement
        | HTMLTextAreaElement
        | HTMLSelectElement
        | HTMLAnchorElement
      >(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );

      candidates.forEach((el) => {
        const htmlEl = el as FocusableElement;
        const rect = htmlEl.getBoundingClientRect();
        const visible = rect.width > 0 && rect.height > 0;
        const topMost = visible ? isElementTopMost(htmlEl) : false;
        if (visible && topMost) {
          elements.push(htmlEl);
        }
      });
    };

    collectElements(container);

    elements.sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();

      if (Math.floor(rectA.top) !== Math.floor(rectB.top)) {
        return Math.floor(rectA.top) - Math.floor(rectB.top);
      }

      return Math.floor(rectA.left) - Math.floor(rectB.left);
    });

    focusableElementsRef.current = elements;
    return elements;
  }, [container]);

  const getCurrentIndex = useCallback(() => {
    const activeEl = document.activeElement as FocusableElement | null;
    const elements = focusableElementsRef.current;

    if (activeEl && elements.includes(activeEl)) {
      return elements.indexOf(activeEl);
    }

    const stateTarget = focusedElementRef.current;
    if (stateTarget && elements.includes(stateTarget)) {
      return elements.indexOf(stateTarget);
    }

    return -1;
  }, []);

  const setFocus = useCallback(
    (element: FocusableElement | string) => {
      const target =
        typeof element === "string"
          ? document.getElementById(element)
          : element;

      if (target && focusableElementsRef.current.includes(target)) {
        target.focus();
        focusedElementRef.current = target;
        setFocusedElement(target);
        onFocusChange?.(target);
      }
    },
    [onFocusChange]
  );

  const navigate = useCallback(
    (direction: NavigationDirection) => {
      const elements = focusableElementsRef.current;
      if (elements.length === 0) return;

      const currentIndex = getCurrentIndex();
      const currentElement = currentIndex >= 0 ? elements[currentIndex] : null;
      const currentRect = currentElement?.getBoundingClientRect();

      if (direction === "home") {
        setFocus(elements[0]);
        return;
      }

      if (direction === "end") {
        setFocus(elements[elements.length - 1]);
        return;
      }

      if (direction === "tab") {
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % elements.length : 0;
        setFocus(elements[nextIndex]);
        return;
      }

      if (direction === "escape") {
        onEscape?.();
        return;
      }

      if (!currentRect || !currentElement) {
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % elements.length : 0;
        setFocus(elements[nextIndex]);
        return;
      }

      const currentCenterX = currentRect.left + currentRect.width / 2;
      const currentCenterY = currentRect.top + currentRect.height / 2;
      const currentMaxBottom = currentRect.bottom;

      let bestCandidate: FocusableElement | null = null;
      let bestDistance = Infinity;

      for (const candidate of elements) {
        if (candidate === currentElement) continue;

        const candidateRect = candidate.getBoundingClientRect();
        const candidateCenterX = candidateRect.left + candidateRect.width / 2;
        const candidateCenterY = candidateRect.top + candidateRect.height / 2;

        let isInDirection = false;
        let primaryAxisDistance = 0;
        let secondaryAxisDistance = 0;

        switch (direction) {
          case "up":
            isInDirection = candidateRect.bottom <= currentRect.top + 1;
            primaryAxisDistance = currentRect.top - candidateRect.bottom;
            secondaryAxisDistance = Math.abs(candidateCenterX - currentCenterX);
            break;
          case "down":
            isInDirection = candidateRect.top >= currentRect.bottom - 1;
            primaryAxisDistance = candidateRect.top - currentRect.bottom;
            secondaryAxisDistance = Math.abs(candidateCenterX - currentCenterX);
            break;
          case "left":
            isInDirection = candidateRect.right <= currentRect.left + 1;
            primaryAxisDistance = currentRect.left - candidateRect.right;
            secondaryAxisDistance = Math.abs(candidateCenterY - currentCenterY);
            break;
          case "right":
            isInDirection = candidateRect.left >= currentRect.right - 1;
            primaryAxisDistance = candidateRect.left - currentRect.right;
            secondaryAxisDistance = Math.abs(candidateCenterY - currentCenterY);
            break;
        }

        if (!isInDirection) continue;

        const maxPrimary = Math.max(currentRect.width, currentRect.height, candidateRect.width, candidateRect.height);
        const maxSecondary = maxPrimary * 2;

        if (primaryAxisDistance < 0) continue;

        const normalizedPrimary = primaryAxisDistance / maxPrimary;
        const normalizedSecondary = secondaryAxisDistance / maxSecondary;
        const distance = normalizedPrimary + normalizedSecondary;

        if (distance < bestDistance) {
          bestDistance = distance;
          bestCandidate = candidate;
        }
      }

      if (bestCandidate) {
        setFocus(bestCandidate);
        return;
      }

      // Fallback: linear movement within current row/column
      if (direction === "up" || direction === "down") {
        const sameColumn = elements.filter((el) => {
          if (el === currentElement) return false;
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          return Math.abs(centerX - currentCenterX) < currentRect.width;
        });

        if (sameColumn.length > 0) {
          sameColumn.sort((a, b) => {
            const rectA = a.getBoundingClientRect();
            const rectB = b.getBoundingClientRect();
            if (direction === "up") {
              return rectA.bottom - rectB.bottom;
            }
            return rectA.top - rectB.top;
          });

          if (direction === "up") {
            setFocus(sameColumn[sameColumn.length - 1]);
          } else {
            setFocus(sameColumn[0]);
          }
          return;
        }
      }

      // Final fallback: linear next/prev
      const nextIndex =
        direction === "up" || direction === "left"
          ? Math.max(0, currentIndex - 1)
          : Math.min(elements.length - 1, currentIndex + 1);

      setFocus(elements[nextIndex]);
    },
    [getCurrentIndex, setFocus, onEscape]
  );

  const activateElement = useCallback(
    (element: FocusableElement) => {
      const tag = element.tagName.toLowerCase();
      if (tag === "a" || tag === "button" || element.getAttribute("role") === "button" || element.getAttribute("role") === "link") {
        (element as HTMLElement).click();
        return;
      }
      onEnter?.(element);
    },
    [onEnter]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActiveRef.current) return;

      const key = event.key.toLowerCase();
      let handled = false;

      switch (key) {
        case "arrowup":
        case "arrowdown":
        case "arrowleft":
        case "arrowright":
          if (!enableArrowKeys) break;
          event.preventDefault();
          const direction = key.replace("arrow", "") as NavigationDirection;
          navigate(direction);
          handled = true;
          break;

        case "enter":
        case " ":
          const activeEl = document.activeElement as FocusableElement | null;
          if (!activeEl) break;
          const activeTag = activeEl.tagName.toLowerCase();
          const isInput = activeTag === "input" || activeTag === "textarea" || activeTag === "select";
          const isSpace = key === " ";
          if (isInput) break;
          event.preventDefault();
          activateElement(activeEl);
          handled = true;
          break;

        case "escape":
          event.preventDefault();
          onEscape?.();
          handled = true;
          break;

        case "home":
          event.preventDefault();
          navigate("home");
          handled = true;
          break;

        case "end":
          event.preventDefault();
          navigate("end");
          handled = true;
          break;

        default:
          if (enableNumberKeys && /^[0-9]$/.test(key)) {
            const activeInput = document.activeElement as HTMLInputElement | null;
            if (activeInput && activeInput.tagName === "INPUT") {
              event.preventDefault();
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
              )?.set;
              nativeInputValueSetter?.call(activeInput, key);
              activeInput.dispatchEvent(new Event("input", { bubbles: true }));
              onEnter?.(activeInput);
              handled = true;
            }
          }
          break;
      }

      if (handled) {
        event.stopPropagation();
      }
    },
    [enableArrowKeys, enableNumberKeys, navigate, activateElement, onEnter, onEscape]
  );

  const refresh = useCallback(() => {
    updateFocusableElements();
  }, [updateFocusableElements]);

  // Initialize focusable elements and focus
  useEffect(() => {
    const elements = updateFocusableElements();

    if (initialFocus) {
      const initial = document.getElementById(initialFocus);
      if (initial && elements.includes(initial)) {
        initial.focus();
        focusedElementRef.current = initial;
      }
    } else if (elements.length > 0) {
      elements[0].focus();
      focusedElementRef.current = elements[0];
    }

    isActiveRef.current = true;
  }, [initialFocus, updateFocusableElements]);

  // Add event listeners
  useEffect(() => {
    const target = container || document;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    target.addEventListener("keydown", handleGlobalKeyDown as EventListener, { capture: true });

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as FocusableElement;
      if (target && target.tagName) {
        focusedElementRef.current = target;
        setFocusedElement(target);
        onFocusChange?.(target);
      }
    };

    document.addEventListener("focus", handleFocusIn as EventListener, true);

    return () => {
      target.removeEventListener("keydown", handleGlobalKeyDown as EventListener, { capture: true });
      document.removeEventListener("focus", handleFocusIn as EventListener, true);
    };
  }, [container, handleKeyDown, onFocusChange]);

  // Refresh on window resize
  useEffect(() => {
    const handleResize = () => {
      refresh();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [refresh]);

  // Watch for modal open/close and refresh navigation targets
  useEffect(() => {
    if (typeof window === "undefined" || !container) return;

    observerRef.current = new MutationObserver(() => {
      refresh();
    });

    observerRef.current.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [container, refresh]);

  return {
    focusedElement,
    setFocus,
    getFocusableElements: () => focusableElementsRef.current,
    refresh,
  };
}
