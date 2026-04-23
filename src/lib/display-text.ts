const INVISIBLE_AND_CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g;
const COLLAPSIBLE_WHITESPACE = /\s+/g;
const ANGLE_BRACKETS = /[<>]/g;

const ANGLE_BRACKET_REPLACEMENTS: Record<string, string> = {
  "<": "‹",
  ">": "›",
};

export function sanitizeDisplayText(value: string) {
  return value
    .replace(COLLAPSIBLE_WHITESPACE, " ")
    .replace(INVISIBLE_AND_CONTROL_CHARACTERS, "")
    .trim()
    .replace(ANGLE_BRACKETS, (character) => ANGLE_BRACKET_REPLACEMENTS[character] ?? character);
}

export function sanitizeOptionalDisplayText(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const sanitized = sanitizeDisplayText(value);
  return sanitized.length > 0 ? sanitized : null;
}
