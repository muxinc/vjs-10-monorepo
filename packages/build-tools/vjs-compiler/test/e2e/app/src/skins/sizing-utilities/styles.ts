function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: 'relative',
  Overlay: 'absolute inset-0 flex items-center justify-center pointer-events-none',
  TestElement: cn(
    // Base visible styles (sizing utilities replace w-24 h-24)
    'bg-white/90',
    'rounded-lg',
    'pointer-events-auto',
    'flex items-center justify-center',
    'text-sm font-medium text-gray-800',

    // Test-specific: sizing utilities
    'w-32 h-20',
  ),
};

export default styles;
