import { useIsSubmitting } from "remix-validated-form";

type SubmitButtonProps = {
  children: React.ReactNode;
  submittingText?: string;
  className?: string;
};

export function SubmitButton({
  children,
  submittingText = "Submitting...",
  className = ""
}: SubmitButtonProps) {
  const isSubmitting = useIsSubmitting();
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`rounded bg-brand-electric-purple text-xl font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-electric-purple/50 ${className}`}
    >
      {isSubmitting ? submittingText : children}
    </button>
  );
}
