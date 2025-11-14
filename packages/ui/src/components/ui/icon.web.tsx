import { cn } from '../../lib/cn';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

type IconProps = LucideProps & {
  as: LucideIcon;
};

/**
 * Web-specific Icon component for Lucide icons.
 * lucide-react already supports className natively, so we pass it directly.
 *
 * @component
 * @example
 * ```tsx
 * import { ArrowRight } from 'lucide-react';
 * import { Icon } from '@project/ui';
 *
 * <Icon as={ArrowRight} className="text-red-500" size={16} />
 * ```
 *
 * @param {LucideIcon} as - The Lucide icon component to render.
 * @param {string} className - Utility classes to style the icon using Tailwind CSS.
 * @param {number} size - Icon size (defaults to 14).
 * @param {...LucideProps} ...props - Additional Lucide icon props.
 */
function Icon({
  as: IconComponent,
  className,
  size = 14,
  ...props
}: IconProps) {
  return (
    <IconComponent
      className={cn('text-foreground', className)}
      size={size}
      {...props}
    />
  );
}

export { Icon };
