const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;

export function sanitizePath(value: string) {
  const clean = value.replace(CONTROL_CHARACTERS, "").trim();
  try {
    const url = new URL(clean, "https://pulse.invalid");
    const path = url.pathname.startsWith("/")
      ? url.pathname
      : `/${url.pathname}`;
    return path.slice(0, 1024) || "/";
  } catch {
    return "/";
  }
}

export function sanitizeTitle(value?: string) {
  const title = value
    ?.replace(CONTROL_CHARACTERS, "")
    .replace(/\s+/g, " ")
    .trim();
  return title ? title.slice(0, 200) : null;
}

export function sanitizeReferrer(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.protocol}//${url.host}${url.pathname}`.slice(0, 1024);
  } catch {
    return null;
  }
}

export function originMatchesDomain(origin: string, domain: string) {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.host.toLowerCase() === domain.toLowerCase()
    );
  } catch {
    return false;
  }
}
