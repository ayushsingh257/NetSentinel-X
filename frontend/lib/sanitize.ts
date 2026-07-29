import DOMPurify from "dompurify";

/**
 * sanitizeHTML cleans user-generated or external HTML string to prevent XSS.
 * Safe for client-side rendering.
 */
export function sanitizeHTML(dirty: string): string {
  if (!dirty) return "";
  if (typeof window === "undefined") {
    // Basic regex fallback during SSR
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
      .replace(/javascript:[^\s"]+/gi, "");
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "span",
    ],
    ALLOWED_ATTR: ["href", "title", "class", "target"],
  });
}
