import { Select as BaseSelect } from '@base-ui-components/react/select';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import CaretIcon from './icons/CaretIcon';
import CheckIcon from './icons/CheckIcon';

export interface SelectOption<T = string> {
  value: T | null;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: SelectOption<T>[];
  className?: string;
  'aria-label'?: string;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  className,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  return (
    <BaseSelect.Root
      value={value}
      onValueChange={onChange}
      items={options}
    >
      <BaseSelect.Trigger
        className={twMerge(
          clsx(
            'inline-flex items-center gap-2 bg-light-60 border border-light-40 rounded-lg text-sm p-2',
          ),
          className,
        )}
        aria-label={ariaLabel}
      >
        <BaseSelect.Value className="flex-1 min-w-0 truncate" />
        <BaseSelect.Icon>
          <CaretIcon />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner
          sideOffset={4}
          className="z-50"
        >
          <BaseSelect.Popup
            className={clsx(
              'border border-light-40 rounded-lg bg-light-60 shadow-xl text-sm',
              'overflow-hidden',
            )}
            style={{
              minWidth: 'var(--anchor-width)',
            } as React.CSSProperties}
          >
            <BaseSelect.List
              // TODO a slick transition
              className={clsx('overflow-y-auto')}
              style={{
                maxHeight: 'calc(var(--available-height) - var(--spacing) * 2)',
                transformOrigin: 'var(--transform-origin)',
              } as React.CSSProperties}
            >
              {options.map(option => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={clsx(
                    'flex items-center gap-2 p-2',
                    'cursor-pointer intent:bg-light-80',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    option.value === value && 'bg-light-80',
                  )}
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className="ml-auto inline-flex items-center">
                    <CheckIcon />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
