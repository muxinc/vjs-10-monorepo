import clsx from 'clsx';
import BaseDemo from './Base';
import EjectDemo from './Eject';

interface Props {
  className?: string;
}

export default function HomePageDemo({ className }: Props) {
  return (
    <section className={clsx('grid gap-x-9 gap-y-6 lg:grid-cols-2', className)}>
      <section className="grid grid-rows-subgrid row-span-2 mb-6 lg:mb-0">
        <header className="max-w-3xl">
          <h2 className="text-h5 font-semibold lg:text-h4 mb-1">Assemble your player</h2>
          <p>Feel at home with your framework, skin, and media source</p>
        </header>
        <BaseDemo className="lg:h-100 m-0" />
      </section>
      <section className="grid grid-rows-subgrid row-span-2 mb-6 lg:mb-0">
        <header className="max-w-3xl">
          <h2 className="text-h5 font-semibold lg:text-h4 mb-1">Take full control</h2>
          <p>Make your player truly your own with fully-editable components</p>
        </header>
        <EjectDemo className="lg:h-100 m-0" />
      </section>
    </section>
  );
}
