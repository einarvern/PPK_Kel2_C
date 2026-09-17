export const formatDateOnly = (value?: string | null, fallback = '') =>
    value ? value.slice(0, 10) : fallback;

export const toDateInputValue = (value?: string | null) =>
    formatDateOnly(value);
