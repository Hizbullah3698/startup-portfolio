const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";
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

/** Turn FastAPI's 422 `detail` array into one message per field. */
function parseFieldErrors(detail: unknown): ContactFieldErrors {
  const errors: ContactFieldErrors = {};
  if (!Array.isArray(detail)) return errors;

  for (const item of detail) {
    const loc: unknown[] = Array.isArray(item?.loc) ? item.loc : [];
    const field = loc[loc.length - 1];
    if (typeof field !== "string" || !FIELDS.includes(field as ContactField)) continue;
    const msg = typeof item.msg === "string" ? item.msg.replace(/^Value error,\s*/i, "") : "";
    errors[field as ContactField] ??= msg || "This field is not valid.";
  }
  return errors;
}

/** POST a visitor inquiry to the public contact endpoint. */
export async function submitContact(payload: ContactPayload): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/contact/`, {
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
      fieldErrors = parseFieldErrors((await response.json())?.detail);
    } catch {
      // Fall through to the generic message.
    }
    throw new ContactError("Please check the highlighted fields and try again.", fieldErrors);
  }

  throw new ContactError("Something went wrong on my end. Please try again in a moment.");
}
