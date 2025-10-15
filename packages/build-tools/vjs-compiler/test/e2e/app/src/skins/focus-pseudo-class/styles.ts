function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: 'relative',
  Overlay: 'absolute inset-0 flex items-center justify-center pointer-events-none',
  TestElement: cn(
    // Base visible styles
    'w-24 h-24',
    'bg-white/90',
    'rounded-lg',
    'pointer-events-auto',
    'flex items-center justify-center',
    'text-sm font-medium text-gray-800',

    // Test-specific: focus pseudo-class
    'opacity-100 focus-visible:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  ),
};

export default styles;
