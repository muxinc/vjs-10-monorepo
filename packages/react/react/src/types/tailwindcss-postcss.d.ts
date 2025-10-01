declare module '@tailwindcss/postcss' {
  import type { AcceptedPlugin } from 'postcss';

  type TailwindOptions = Record<string, unknown>;

  export default function tailwindcss(options: TailwindOptions): AcceptedPlugin;
}
