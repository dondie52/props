import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,28,30,0.5)]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-[90%] max-w-[520px] rounded-large bg-bg-card p-10 shadow-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text-main">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
