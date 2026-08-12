export const truncate = (text: string | undefined, limit: number = 20): string => {
  if (!text) return 'N/A';
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};
