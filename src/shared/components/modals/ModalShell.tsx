import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Reusable bottom-sheet modal shell.
 * Locks body scroll while open and traps focus via the dialog role.
 */
export default function ModalShell({ title, onClose, children }: Props) {
  // Lock body scroll while the modal is mounted
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-sm flex flex-col rounded-t-3xl overflow-hidden"
        style={{
          background: "oklch(0.19 0.028 255)",
          border: "1px solid oklch(0.28 0.04 255)",
          borderBottom: "none",
          maxHeight: "90dvh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "oklch(0.40 0.02 255)" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid oklch(0.26 0.03 255)" }}
        >
          <h2
            id="modal-title"
            className="text-base font-bold text-foreground tracking-tight"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-muted"
            aria-label="Close modal"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div
          className="overflow-y-auto px-5 py-5 flex flex-col gap-4"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
