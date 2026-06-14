declare module 'recharts' {
  import * as React from 'react';
  export { ResponsiveContainer } from 'recharts';
  export const ResponsiveContainerProps: React.ComponentProps<typeof import('recharts').ResponsiveContainer>;
}
