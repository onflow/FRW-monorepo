import * as TabsPrimitive from '@rn-primitives/tabs';
import * as React from 'react';
import { Text } from 'react-native';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: TabsPrimitive.ListProps & {
  ref?: React.RefObject<TabsPrimitive.ListRef>;
}) {
  return (
    <TabsPrimitive.List
      className={cn(
        'web:inline-flex h-10 native:h-12 items-center justify-center rounded-md bg-muted p-1 native:px-1.5',
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: TabsPrimitive.TriggerProps & {
  ref?: React.RefObject<TabsPrimitive.TriggerRef>;
  children?: React.ReactNode;
}) {
  const { value } = TabsPrimitive.useRootContext();
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center shadow-none web:whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium web:ring-offset-background web:transition-all web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        props.disabled && 'web:pointer-events-none opacity-50',
        props.value === value && 'bg-background shadow-lg shadow-foreground/10 text-foreground',
        'text-sm native:text-base font-medium text-muted-foreground web:transition-all',
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & {
  ref?: React.RefObject<TabsPrimitive.ContentRef>;
}) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
