export function renderToString(attrs: Record<string, string>, body: string): string {
  const attributes = Object.entries({
    width: '100%',
    height: '100%',
    viewBox: '0 0 32 32',
    fill: 'none',
    'aria-hidden': 'true',
    focusable: 'false',
    xmlns: 'http://www.w3.org/2000/svg',
    ...attrs,
  })
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `<svg ${attributes}>${body}</svg>`;
}
