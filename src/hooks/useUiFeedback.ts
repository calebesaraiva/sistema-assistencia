import { useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

export function useUiFeedback() {
  const [isLoading, setIsLoading] = useState(false);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    window.dispatchEvent(
      new CustomEvent("app:toast", {
        detail: { message, type },
      })
    );
  }, []);

  async function withLoading(
    setLocalLoading: (v: boolean) => void,
    fn: () => Promise<void>
  ) {
    setLocalLoading(true);
    setIsLoading(true);
    try {
      await fn();
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  }

  return { showToast, withLoading, isLoading };
}
