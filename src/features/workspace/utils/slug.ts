export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function uniqueSlug(base: string, suffix?: string): string {
  const root = slugify(base) || "workspace";
  if (!suffix) return root;
  return `${root}-${suffix}`.slice(0, 60);
}
