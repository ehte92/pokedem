'use client';

import { ReactNode } from 'react';

import { Providers } from '@/app/Providers';

export const Document = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-capable" content="yes"></meta>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        {/* <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg"
          color={theme.colors.gray?.['800']}
        />
        <meta
          name="msapplication-TileColor"
          content={theme.colors.gray?.['800']}
        />
        <meta name="theme-color" content={theme.colors.gray?.['800']} /> */}
      </head>
      <body className="min-h-screen bg-gray-100 dark:bg-gray-900 font-pixel antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};
