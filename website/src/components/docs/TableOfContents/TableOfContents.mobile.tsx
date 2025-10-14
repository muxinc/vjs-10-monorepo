import type { MarkdownHeading } from 'astro';
import clsx from 'clsx';
import { Select } from '@/components/Select';

interface TableOfContentsMobileProps {
  headings: MarkdownHeading[];
  activeId: string;
  onNavigate: (slug: string) => void;
  className?: string;
}

export function TableOfContentsMobile({ headings, activeId, onNavigate, className }: TableOfContentsMobileProps) {
  const handleChange = (slug: string | null) => {
    if (slug) onNavigate(slug);
  };

  const options = [
    { value: null, label: 'On this page…' },
    ...headings.map(heading => ({
      value: heading.slug,
      label: `${'\u00A0'.repeat((heading.depth - 2) * 2)}${heading.text}`,
    })),
  ];

  return (
    <div
      className={clsx('border-b border-light-40 bg-light-80 px-5 py-2.5 h-[--h]', className)}
      style={{ '--h': 'var(--mobile-toc-h)' } as React.CSSProperties}
    >
      <div className="w-full max-w-3xl mx-auto">
        <Select
          value={activeId || null}
          onChange={handleChange}
          options={options}
          aria-label="Table of contents"
        />
      </div>
    </div>
  );
}
