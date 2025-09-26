import { paths } from '@/icons';
import { renderToString } from '@/render';

export class VjsIconElement {
  static tagName = 'vjs-icon';

  render(attrs: Record<string, string> = {}): string {
    return renderToString(attrs, paths[VjsIconElement.tagName] ?? '');
  }
}
