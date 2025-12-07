// src/components/feedback/ToastListener.tsx
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

export default function ToastListener() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    function handler(e: Event) {
      const { message, type } = (e as CustomEvent).detail as {
        message: string;
        type?: ToastType;
      };

      setToast({
        id: Date.now(),
        message,
        type: type ?? "info",
      });

      // some em 3s
      setTimeout(() => {
        setToast((current) =>
          current && current.id === toast?.id ? null : current
        );
      }, 3000);
    }

    window.addEventListener("app:toast", handler as EventListener);

    return () => {
      window.removeEventListener("app:toast", handler as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!toast) return null;

  const base =
    "fixed z-50 bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-sm border ";
  const color =
    toast.type === "success"
      ? "bg-emerald-900/90 border-emerald-500 text-emerald-50"
      : toast.type === "error"
      ? "bg-rose-900/90 border-rose-500 text-rose-50"
      : "bg-slate-900/90 border-slate-500 text-slate-50";

  return (
    <div className={base + color}>
      {toast.message}
    </div>
  );
}
