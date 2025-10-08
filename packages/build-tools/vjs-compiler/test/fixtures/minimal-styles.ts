// Utility to merge class names
function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const styles = {
  Container: 'relative',
  Controls: 'flex gap-2',
  Button: 'p-2 rounded',
};

export default styles;
