export const firstError = (errors: Record<string, string>, fallback: string) =>
    Object.values(errors)[0] || fallback;
