declare module '@playwright/test' {
  export interface Page {
    goto(url: string): Promise<void>;
  }

  export function test(name: string, fn: (args: { page: Page }) => Promise<void>): void;
  export const expect: {
    (actual: any): {
      toBeVisible(): Promise<void>;
      toHaveTitle(pattern: RegExp): Promise<void>;
      toHaveURL(pattern: RegExp): Promise<void>;
    };
  };
}
