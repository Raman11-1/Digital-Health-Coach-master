// FastAPI returns errors two different shapes: a plain string for a manually
// raised HTTPException, or an array of pydantic validation-error objects
// ({loc, msg, ...}) for a 422. Rendering that array directly in JSX crashes
// the page ("Objects are not valid as a React child"), so always go through
// this to get a plain, readable string.
export function getErrorMessage(err: any, fallback = "Something went wrong. Please try again."): string {
  const detail = err?.response?.data?.detail;

  if (!detail) return fallback;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((d: any) => {
        if (typeof d === "string") return d;
        const msg = String(d?.msg || "").replace(/^Value error,\s*/i, "");
        const field = Array.isArray(d?.loc) ? d.loc[d.loc.length - 1] : null;
        return field && typeof field === "string" && msg ? `${field}: ${msg}` : msg;
      })
      .filter(Boolean);
    return messages.length > 0 ? messages.join(" ") : fallback;
  }

  return fallback;
}
