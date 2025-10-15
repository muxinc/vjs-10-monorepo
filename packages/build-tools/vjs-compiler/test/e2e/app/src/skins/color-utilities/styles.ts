function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: 'relative',
  Overlay: 'absolute inset-0 flex items-center justify-center pointer-events-none',
  TestElement: cn(
    // Base visible styles
    'w-24 h-24',
    'rounded-lg',
    'pointer-events-auto',
    'flex items-center justify-center',
    'text-sm font-medium',

    // Test-specific: color utilities (replaces bg-white/90 and text-gray-800)
    'bg-blue-500/80 text-white',
  ),
};

export default styles;
