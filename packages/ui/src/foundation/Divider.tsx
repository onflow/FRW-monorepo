import type { ComponentProps } from 'react';

import { Separator } from './Separator';

type DividerProps = ComponentProps<typeof Separator>;

/**
 * Divider component for separating list items or content sections.
 * This is a semantic wrapper around Separator for better component naming consistency.
 */
export function Divider(props: DividerProps): React.ReactElement {
  return <Separator {...props} />;
}

export { Divider as UIDivider };
