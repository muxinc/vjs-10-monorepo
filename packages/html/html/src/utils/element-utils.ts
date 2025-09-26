export const cn = (...classNames: string[]): string => ['icon', ...classNames].filter(Boolean).join(' ');

export function namedNodeMapToObject(namedNodeMap: NamedNodeMap): Record<string, string> {
  const obj: Record<string, string> = {};

  for (const attr of namedNodeMap) {
    obj[attr.name] = attr.value;
  }

  return obj;
}
