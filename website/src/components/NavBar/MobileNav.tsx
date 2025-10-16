import { Dialog } from '@base-ui-components/react/dialog';
import clsx from 'clsx';
import CloseIcon from '../icons/CloseIcon';
import MenuIcon from '../icons/MenuIcon';

interface NavLink {
  href: string;
  label: string;
  matchPath: string | null;
}

export interface MobileNavProps {
  navLinks: NavLink[];
  currentPath: string;
  dark?: boolean;
  children?: React.ReactNode;
}

export default function MobileNav({ navLinks, currentPath, dark = false, children }: MobileNavProps) {
  return (
    <Dialog.Root modal>
      {/* Trigger button - hamburger menu */}
      <Dialog.Trigger
        className={clsx('lg:hidden flex items-center justify-center p-3 h-full aspect-square', dark ? 'bg-light-80 text-dark-100 intent:bg-light-40' : 'bg-dark-100 text-light-80 intent:bg-dark-80')}
        aria-label="Open navigation menu"
      >
        <MenuIcon />
      </Dialog.Trigger>

      {/* Portal renders outside DOM hierarchy */}
      <Dialog.Portal>
        {/* Backdrop overlay */}
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />

        {/* Popup container */}
        <Dialog.Popup className={clsx('fixed inset-0 z-50 flex flex-col', dark ? 'bg-dark-100 text-light-80' : 'bg-light-80 text-dark-100')}>
          {/* Header with close button */}
          <div
            className={clsx(
              'flex justify-between items-center pl-3 border-b',
              dark ? 'border-dark-80' : 'border-light-40',
            )}
            style={{ height: 'var(--nav-h)' }}
          >
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <p className="text-h5 px-3">VideoJS</p>
            <Dialog.Close className={clsx('flex items-center justify-center p-3 h-full aspect-square', dark ? 'bg-light-80 text-dark-100 intent:bg-light-40' : 'bg-dark-100 text-light-80 intent:bg-dark-80')} aria-label="Close navigation menu">
              <CloseIcon />
            </Dialog.Close>
          </div>

          {/* Children */}
          {children ? <div className={clsx('border-b', dark ? 'border-dark-80' : 'border-light-40')}>{children}</div> : null}

          {/* Navigation links */}
          <nav className="flex flex-col py-3">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={clsx('text-md px-6 py-3', link.matchPath && currentPath.startsWith(link.matchPath) ? 'underline' : 'intent:underline')}
                aria-current={link.matchPath && currentPath.startsWith(link.matchPath) ? 'page' : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
