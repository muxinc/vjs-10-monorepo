function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Wrapper: 'relative',
  Overlay: 'absolute inset-0 flex items-center justify-center pointer-events-none',
  Outer: 'p-2 border-2 border-white/50 rounded-xl',
  Middle: 'p-2 border-2 border-white/30 rounded-lg',
  TestElement: cn(
    // Base visible styles
    'w-20 h-20',
    'bg-white/90',
    'rounded',
    'pointer-events-auto',
    'flex items-center justify-center',
    'text-sm font-medium text-gray-800',
  ),
};

export default styles;
