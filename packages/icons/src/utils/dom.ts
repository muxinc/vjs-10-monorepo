export function createTemplate(content: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = content;
  return template.content;
}

export function cloneTemplateContent<T>(content: DocumentFragment): T {
  const fragment = content.cloneNode(true);
  return (fragment as Element).firstElementChild as T;
}
