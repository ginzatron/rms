import { useEffect, useRef } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /**
   * When true, renders as a nested (second-level) sheet with:
   * - Higher z-index to stack above the parent sheet
   * - Darker backdrop for stronger visual separation
   * - Slightly smaller max-height so the parent peeks behind
   * - Distinct visual styling (blue accent, different background)
   * - A back arrow + close button in the header
   */
  nested?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  nested = false,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open (only for primary sheets)
  useEffect(() => {
    if (!nested) {
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, nested]);

  // Z-index layers: primary = 40/50, nested = 60/70
  const backdropZ = nested ? "z-[60]" : "z-40";
  const sheetZ = nested ? "z-[70]" : "z-50";
  const maxHeight = nested ? "max-h-[65vh]" : "max-h-[85vh]";
  const contentMaxHeight = nested ? "calc(65vh - 56px)" : "calc(85vh - 56px)";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 ${backdropZ} bg-black transition-opacity duration-300
          ${
            isOpen
              ? nested
                ? "opacity-60"
                : "opacity-50"
              : "opacity-0 pointer-events-none"
          }
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={nested ? "nested-sheet-title" : "bottom-sheet-title"}
        className={`
          fixed inset-x-0 bottom-0 ${sheetZ}
          ${maxHeight} overflow-hidden
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-y-0" : "translate-y-full"}
          ${
            nested
              ? "bg-blue-50 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.25)]"
              : "bg-white rounded-t-2xl shadow-xl"
          }
        `}
      >
        {/* Colored accent bar for nested sheet */}
        {nested && <div className="h-1.5 bg-blue-500 rounded-t-3xl" />}

        {/* Header */}
        <div
          className={`
            flex items-center gap-3 px-4 h-14
            ${
              nested
                ? "bg-blue-50 border-b border-blue-200"
                : "bg-white border-b border-gray-200"
            }
          `}
        >
          {nested ? (
            <>
              {/* Back button */}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1 py-1.5 px-2 -ml-2 rounded-lg text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors"
                aria-label="Back"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>

              {/* Title */}
              <h2
                id="nested-sheet-title"
                className="text-sm font-semibold text-gray-900 flex-1 text-center truncate"
              >
                {title}
              </h2>

              {/* Close X button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 active:bg-blue-300 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Spacer to balance the close button */}
              <div className="w-8" />

              {/* Title */}
              <h2
                id="bottom-sheet-title"
                className="text-lg font-semibold text-gray-900 text-center flex-1 truncate"
              >
                {title}
              </h2>

              {/* Close X button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div
          className={`overflow-y-auto overscroll-contain p-4 ${
            nested ? "bg-blue-50" : ""
          }`}
          style={{ maxHeight: contentMaxHeight }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
