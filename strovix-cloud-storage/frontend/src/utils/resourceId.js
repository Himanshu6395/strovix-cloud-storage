/** Prefer Java `id`, fall back to legacy Mongo `_id`. */
export function resourceId(item) {
  if (!item || typeof item !== 'object') return undefined;
  return item.id || item._id || undefined;
}

export default { resourceId };
