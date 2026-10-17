const REQUEST_TIMEOUT_MS = 10000;

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactField = keyof ContactPayload;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

const FIELDS: ContactField[] = ["name", "email", "subject", "message"];

/** Error from submitContact(). `fieldErrors` is filled from a 422 response. */
export class ContactError extends Error {
  fieldErrors: ContactFieldErrors;

  constructor(message: string, fieldErrors: ContactFieldErrors = {}) {
    super(message);
    this.name = "ContactError";
    this.fieldErrors = fieldErrors;
  }
}

/** Keep only known fields from the route's 422 `errors` object. */
function parseFieldErrors(errors: unknown): ContactFieldErrors {
  const result: ContactFieldErrors = {};
  if (!errors || typeof errors !== "object") return result;
  for (const field of FIELDS) {
    const msg = (errors as Record<string, unknown>)[field];
    if (typeof msg === "string") result[field] = msg;
  }
  return result;
}

/** POST a visitor inquiry to the Next.js contact route. */
export async function submitContact(payload: ContactPayload): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new ContactError(
      "Could not reach the server. Please try again, or email me directly.",
    );
  }

  if (response.ok) return;

  if (response.status === 422) {
    let fieldErrors: ContactFieldErrors = {};
    try {
      fieldErrors = parseFieldErrors((await response.json())?.errors);
    } catch {
      // Fall through to the generic message.
    }
    throw new ContactError("Please check the highlighted fields and try again.", fieldErrors);
  }

  throw new ContactError("Something went wrong on my end. Please try again in a moment.");
}
