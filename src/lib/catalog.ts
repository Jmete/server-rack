export interface ManufacturerGroup<T> {
  manufacturer: string;
  items: T[];
}

export function groupByManufacturer<T extends { manufacturer: string; name: string }>(
  items: T[]
): ManufacturerGroup<T>[] {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = item.manufacturer || 'Other';
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([manufacturer, groupedItems]) => ({
      manufacturer,
      items: groupedItems.slice().sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
