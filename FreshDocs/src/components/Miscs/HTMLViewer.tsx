import React, { useMemo } from 'react';

export interface HTMLViewerProps {
  /** 
   * If provided, iframe will load this URL directly (recommended).
   * Works well when you `import url from '@site/src/data/some.html'`.
   */
  src?: string;
  /**
   * Raw HTML string to be embedded as iframe srcDoc.
   * Use with `import html from '!!raw-loader!@site/src/data/some.html'`.
   */
  html?: string;
  /** Iframe height in pixels (default: 700) */
  height?: number;
  /** Accessible title for the iframe */
  title?: string;
  /** Extra CSS className */
  className?: string;
  /** Allow sandbox flags for iframe; defaults enable scripts and same-origin */
  sandbox?: string;
}

const defaultSandbox = [
  'allow-scripts',
  'allow-same-origin',
  'allow-downloads',
  'allow-forms',
  'allow-pointer-lock',
  'allow-popups',
].join(' ');

export default function HTMLViewer({
  src,
  html,
  height = 700,
  title = 'Embedded HTML',
  className,
  sandbox = defaultSandbox,
}: HTMLViewerProps) {
  // If using html string, create a stable srcDoc
  const srcDoc = useMemo(() => (html ? html : undefined), [html]);

  return (
    <iframe
      title={title}
      src={src}
      srcDoc={src ? undefined : srcDoc}
      width="100%"
      height={height}
      sandbox={sandbox}
      style={{
        border: '1px solid var(--ifm-color-emphasis-200)',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}