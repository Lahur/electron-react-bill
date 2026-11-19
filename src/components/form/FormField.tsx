import type {ReactNode} from "react";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {cn} from "@/utils";

interface FormFieldProps {
  label?: ReactNode;
  htmlFor?: string;
  /** Error message; when set the field is rendered as invalid. */
  error?: string;
  /** Helper text shown below the control when there is no error. */
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Label + control + error/description, built on the shared Field primitives. */
export default function FormField({
  label,
  htmlFor,
  error,
  description,
  className,
  children,
}: FormFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined} className={cn("gap-1.5", className)}>
      {label && <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>}
      {children}
      {error ? (
        <FieldError className="text-xs">{error}</FieldError>
      ) : (
        description && <FieldDescription className="text-xs">{description}</FieldDescription>
      )}
    </Field>
  );
}
