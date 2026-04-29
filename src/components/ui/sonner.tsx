import {
  Toaster as Sonner,
  type ToasterProps,
} from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "!bg-overlay !text-primary !border-border-hover",
          success: "!bg-teal !text-primary !border-teal/40",
          error: "!bg-coral !text-primary !border-coral/40",
          warning: "!bg-amber !text-primary !border-amber/40",
          info: "!bg-purple !text-primary !border-purple/40",
        },
      }}
      {...props}
    />
  );
}
