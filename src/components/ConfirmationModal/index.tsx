import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  icon?: ReactNode;
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
  areButtonsColumn?: boolean;
}

export function ConfirmationModal({
  icon,
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onConfirm,
  onCancel,
  areButtonsColumn = false,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 backdrop-blur-md bg-background/60 flex items-center justify-center px-3">
      <div className="bg-surface border border-border rounded-xl p-6 md:p-8 max-w-sm text-center">
        {icon && (
          <div className="size-8 mb-4 mx-auto flex items-center justify-center">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-medium text-primary">{title}</h2>
        <p className="text-sm text-secondary mt-2">{description}</p>
        {areButtonsColumn ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button variant="default" onClick={onConfirm}>
              {primaryButtonText}
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-sm text-muted border-0"
            >
              {secondaryButtonText}
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex flex-row items-center justify-center gap-3">
            <Button variant="outline" onClick={onCancel}>
              {secondaryButtonText}
            </Button>
            <Button variant="default" onClick={onConfirm}>
              {primaryButtonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
