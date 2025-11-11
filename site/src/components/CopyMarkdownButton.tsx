import { useState } from 'react';
import useIsHydrated from '@/utils/useIsHydrated';

export interface CopyMarkdownButtonProps {
  children: React.ReactNode;
  copied?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  timeout?: number;
}

export default function CopyMarkdownButton({
  children,
  copied,
  className,
  style,
  timeout = 2000,
}: CopyMarkdownButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isHydrated = useIsHydrated();
  const disabled = !isHydrated || isLoading;

  const handleCopy = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current pathname and construct markdown URL
      const pathname = window.location.pathname;
      const mdUrl = `${pathname}.md`;

      // Fetch the markdown file
      const response = await fetch(mdUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch markdown: ${response.status} ${response.statusText}`);
      }

      const markdown = await response.text();

      // Copy to clipboard
      await navigator.clipboard.writeText(markdown);

      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
      setError(err instanceof Error ? err.message : 'Failed to copy markdown');
      setTimeout(() => {
        setError(null);
      }, timeout);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleCopy}
      className={className}
      style={style}
      aria-label={isCopied ? 'Copied' : 'Copy markdown to clipboard'}
    >
      {error ? 'Error' : isCopied ? (copied || children) : isLoading ? 'Loading...' : children}
    </button>
  );
}
