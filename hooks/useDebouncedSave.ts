import { useCallback, useEffect, useRef } from "react";

export function useDebouncedCallback<T extends (...args: never[]) => void>(
  fn: T,
  delayMs: number
): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    fnRef.current();
  }, []);

  useEffect(() => {
    const onHide = () => flush();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onHide);
      window.addEventListener("pagehide", onHide);
      return () => {
        document.removeEventListener("visibilitychange", onHide);
        window.removeEventListener("pagehide", onHide);
      };
    }
  }, [flush]);

  const debounced = useCallback(
    ((..._args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        fnRef.current();
      }, delayMs);
    }) as T,
    [delayMs]
  );

  return debounced;
}