import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';

import { Error } from '@/components/Error';
import { useEffect } from 'react';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Tiny5&display=swap',
      },
    ],
    styles: [
      {
        children: `
          body {
            background: #09090b;
            color: white;
            color-scheme: dark;
          }
        `,
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: () => <div>Not found</div>,
  errorComponent: Error,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preventDefault = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    return () => document.removeEventListener('contextmenu', preventDefault);
  }, []);

  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body className='overflow-hidden'>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
