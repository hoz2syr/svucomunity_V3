"use client";

import { cn } from '@/src/lib/utils'; import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Components } from 'react-markdown';
import { useEffect, useRef, useState } from 'react';
import remarkGfm from 'remark-gfm';

const MermaidBlock = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({ startOnLoad: false });
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && containerRef.current) {
          if (containerRef.current) { containerRef.current.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } }); }
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    return <pre className="text-red-400 text-xs whitespace-pre-wrap">{chart}</pre>;
  }
  return <div ref={containerRef} className="flex justify-center my-3" />;
};

const RichText = ({ children: _children, className = '' }: { children: string; className?: string }) => {
  return (
    <div className={cn('prose prose-invert max-w-none text-secondary-200', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={
          {
            p: ({ children, ...props }) => (
              <p className="mb-2 last:mb-0 leading-relaxed" {...props}>{children}</p>
            ),
            ul: ({ children, ...props }) => (
              <ul className="list-disc list-inside mb-2 space-y-1" {...props}>{children}</ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>{children}</ol>
            ),
            li: ({ children, ...props }) => (
              <li className="leading-relaxed" {...props}>{children}</li>
            ),
            strong: ({ children, ...props }) => (
              <strong className="text-white font-bold" {...props}>{children}</strong>
            ),
            em: ({ children, ...props }) => (
              <em className="italic text-secondary-100" {...props}>{children}</em>
            ),
            code: ({ children, className: codeClassName, ...props }) => {
              const match = /language-(?<lang>\w+)/.exec(codeClassName || '');
              const lang = match?.groups?.lang;
              if (lang === 'mermaid') {
                return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
              }
              return (
                <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-sm font-mono" {...props}>{children}</code>
              );
            },
            pre: ({ children, ...props }) => {
              const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;
              const codeClassName = child?.props?.className || '';
              const match = /language-(?<lang>\w+)/.exec(codeClassName);
              const lang = match?.groups?.lang;
              if (lang === 'mermaid') {
                return <MermaidBlock chart={String(child?.props?.children).replace(/\n$/, '')} />;
              }
              return (
                <pre className="p-3 rounded-xl bg-slate-900 border border-white/10 overflow-x-auto text-sm" {...props}>{children}</pre>
              );
            },
            blockquote: ({ children, ...props }) => (
              <blockquote className="border-r-2 border-cyan-500/50 pr-3 italic text-secondary-300" {...props}>{children}</blockquote>
            ),
            a: ({ children, href, ...props }) => (
              <a href={href} className="text-cyan-400 underline hover:text-cyan-300" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
            ),
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto mb-2">
                <table className="border-collapse border border-white/10" {...props}>{children}</table>
              </div>
            ),
            th: ({ children, ...props }) => (
              <th className="border border-white/10 px-3 py-2 bg-slate-800 text-white text-sm" {...props}>{children}</th>
            ),
            td: ({ children, ...props }) => (
              <td className="border border-white/10 px-3 py-2 text-sm" {...props}>{children}</td>
            ),
            h1: ({ children, ...props }) => (
              <h1 className="text-xl font-bold text-white mb-2 mt-4" {...props}>{children}</h1>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="text-lg font-bold text-white mb-2 mt-3" {...props}>{children}</h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="text-base font-bold text-white mb-1 mt-2" {...props}>{children}</h3>
            ),
            hr: (props) => (
              <hr className="border-white/10 my-3" {...props} />
            ),
          } as Components
        }
      >
        {_children}
      </ReactMarkdown>
    </div>
  );
};

export { RichText };

