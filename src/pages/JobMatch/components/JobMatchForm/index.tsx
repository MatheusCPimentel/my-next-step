import type { ReactNode } from "react";
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Explainer } from "@/pages/JobMatch/components/Explainer";
import type { FormValues } from "@/pages/JobMatch/types";

interface JobMatchFormProps {
  titleBlock: ReactNode;
  register: UseFormRegister<FormValues>;
  handleSubmit: UseFormHandleSubmit<FormValues>;
  errors: FieldErrors<FormValues>;
  onValid: (values: FormValues) => void;
  isSubmitDisabled: boolean;
}

export function JobMatchForm({
  titleBlock,
  register,
  handleSubmit,
  errors,
  onValid,
  isSubmitDisabled,
}: JobMatchFormProps) {
  return (
    <>
      {titleBlock}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <div className="md:col-span-2 flex flex-col">
          <form
            onSubmit={handleSubmit(onValid)}
            className="flex-1 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary">Job title</label>
              <Input
                placeholder="Senior Frontend Engineer at Acme"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-red-500 text-xs">{errors.title.message}</p>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-secondary">Job description</label>
              <Textarea
                maxLength={8000}
                placeholder="Paste the full job description here..."
                className="flex-1 min-h-[280px] border border-border rounded-lg"
                error={errors.description?.message}
                {...register("description")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary">
                Additional context
              </label>
              <Textarea
                maxLength={1000}
                placeholder="Anything the job description doesn't cover — recruiter info, company culture impressions, why you're interested..."
                className="min-h-[100px] border border-border rounded-lg"
                error={errors.additionalContext?.message}
                {...register("additionalContext")}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full h-11 text-base"
            >
              <Sparkles size={14} className="mr-2" />
              <span>Analyze</span>
            </Button>
          </form>
        </div>
        <Explainer />
      </div>
    </>
  );
}
