export function nanoid(prefix = '') {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  return prefix ? `${prefix}_${id}` : id;
}
