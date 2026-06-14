declare module './eslint/index.js' {
  const value: unknown;
  export default value;
}
declare module './tailwind/index.js' {
  const value: unknown;
  export default value;
}
declare module './vite/index.js' {
  const value: unknown;
  export default value;
}
declare module './vitest/index.js' {
  const value: unknown;
  export default value;
}

export { default as eslint } from './eslint/index.js';
export { default as tailwind } from './tailwind/index.js';
export { default as vite } from './vite/index.js';
export { default as vitest } from './vitest/index.js';
