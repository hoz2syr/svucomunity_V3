import { useState, useEffect, useCallback } from 'react';

type RouteRecord = {
  path: string;
  component: React.ComponentType;
};

const routes: RouteRecord[] = [];

function getCurrentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/dashboard';
}

function isActive(routePath: string): boolean {
  return getCurrentPath() === routePath;
}

function navigate(path: string) {
  window.location.hash = path;
}

function useRoute() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const onHashChange = () => setTick(t => t + 1);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const currentPath = getCurrentPath();
  const matchedRoute = routes.find(r => r.path === currentPath) ?? routes.find(r => r.path === '/dashboard') ?? null;

  return {
    path: currentPath,
    isActive: (path: string) => isActive(path),
    navigate,
    Component: matchedRoute?.component ?? DashboardPlaceholder,
  };
}

function DashboardPlaceholder() {
  return <div>Not Found</div>;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const { Component } = useRoute();
  return <Component />;
}

export function Link({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  const active = isActive(to);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <a href={`#${to}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export function registerRoute(path: string, component: React.ComponentType) {
  routes.push({ path, component });
}

export { useRoute, isActive, navigate };
