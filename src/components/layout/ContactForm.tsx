"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import {
  ContactError,
  submitContact,
  type ContactField,
  type ContactFieldErrors,
  type ContactPayload,
} from "@/lib/contactApi";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: ContactPayload = { name: "", email: "", subject: "", message: "" };
/** Deliberately unlike any autofill target (not "website", "url", "company", ...). */
const HONEYPOT_NAME = "hp_trap_field";
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const inputClass =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-body text-text " +
  "placeholder:text-ticker transition-colors duration-300 motion-reduce:transition-none " +
  "hover:border-card-line focus:border-accent aria-[invalid=true]:border-accent";

function validate(values: ContactPayload): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your email.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Please enter a valid email address.";
  if (!values.subject.trim()) errors.subject = "Please enter a subject.";
  if (!values.message.trim()) errors.message = "Please write a message.";
  return errors;
}

/** Contact form wired to POST /api/contact/. */
export function ContactForm() {
  const [values, setValues] = useState<ContactPayload>(EMPTY);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const isSubmitting = status === "submitting";

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = event.target.name as ContactField;
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    // Honeypot: real visitors never see or fill this field. Bots do.
    // Ignore the submit without touching the form or the status message.
    const honeypot = new FormData(event.currentTarget).get(HONEYPOT_NAME);
    if (typeof honeypot === "string" && honeypot.trim() !== "") return;

    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      setStatus("error");
      setStatusMessage("Please fix the highlighted fields and try again.");
      return;
    }

    setStatus("submitting");
    setStatusMessage("");

    try {
      await submitContact({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      setValues(EMPTY);
      setStatus("success");
      setStatusMessage("Thank you. Your message was sent and I will get back to you soon.");
    } catch (error) {
      console.error("Contact form submit failed:", error);
      const contactError = error instanceof ContactError ? error : null;
      setErrors(contactError?.fieldErrors ?? {});
      setStatus("error");
      setStatusMessage(
        contactError?.message ?? "Something went wrong. Please try again in a moment.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-[720px] flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field id="contact-name" label="Name" error={errors.name}>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={255}
            required
            value={values.name}
            onChange={handleChange}
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={255}
            required
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="contact-subject" label="Subject" error={errors.subject}>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          maxLength={255}
          required
          value={values.subject}
          onChange={handleChange}
          placeholder="What is this about?"
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? "contact-subject-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field id="contact-message" label="Message" error={errors.message}>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={handleChange}
          placeholder="Tell me about your project"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={cn(inputClass, "resize-y")}
        />
      </Field>

      {/* Honeypot: hidden from people and assistive tech, left in the DOM for bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="hp-trap-field">Leave this field empty</label>
        <input
          id="hp-trap-field"
          name={HONEYPOT_NAME}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-white/15 bg-accent px-[22px] py-[15px]",
            "text-[15px] font-semibold leading-none text-white shadow-[0_12px_40px_rgba(234,0,68,0.45)]",
            "transition-[transform,background-color,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "hover:-translate-y-0.5 hover:scale-105 hover:bg-accent-hover active:scale-[0.97]",
            "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100",
          )}
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </button>

        <p
          role="status"
          aria-live="polite"
          className={cn(
            "text-[15px] leading-[1.4]",
            status === "success" && "font-medium text-text",
            status === "error" && "text-accent-hover",
          )}
        >
          {statusMessage}
        </p>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-small text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-small text-accent-hover">
          {error}
        </p>
      )}
    </div>
  );
}
