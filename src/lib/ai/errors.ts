/** Readable message from an AI route error (the routes reply with JSON `{ error }`). */
export function errorText(error: Error) {
  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    if (parsed.error) return parsed.error;
  } catch {}
  return error.message && error.message.length < 200 ? error.message : "Something went wrong. Please try again.";
}
