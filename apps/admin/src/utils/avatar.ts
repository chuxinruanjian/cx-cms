export const getAvatarText = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts
      .slice(0, 2)
      .map((part) => Array.from(part)[0])
      .join('')
      .toUpperCase();
  }
  return Array.from(parts[0] || '管理员')
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
