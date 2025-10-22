import { Toggle } from '@base-ui-components/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui-components/react/toggle-group';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ToggleOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface ToggleGroupProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: ToggleOption<T>[];
  className?: string;
  toggleClassName?: string;
  'aria-label'?: string;
}

export default function ToggleGroup<T extends string = string>({
  value,
  onChange,
  options,
  className,
  toggleClassName,
  'aria-label': ariaLabel,
}: ToggleGroupProps<T>) {
  const handleChange = (newValue: string[]) => {
    if (newValue.length > 0) {
      onChange(newValue[0] as T);
    }
  };

  return (
    <BaseToggleGroup
      value={[value]}
      onValueChange={handleChange}
      multiple={false}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-5',
        ),
        className,
      )}
      aria-label={ariaLabel}
    >
      {options.map(option => (
        <Toggle
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={twMerge(clsx(
            'text-dark-40 dark:text-light-40 data-[pressed]:text-current',
            'py-3 border-b border-transparent',
            option.disabled ? 'opacity-50 cursor-not-allowed' : 'intent:border-dark-40 dark:intent:border-light-40 data-[pressed]:border-current cursor-pointer',
          ), toggleClassName)}
        >
          {option.label}
        </Toggle>
      ))}
    </BaseToggleGroup>
  );
}
