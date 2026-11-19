import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0f1419" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Yam Sushi" />
        <link rel="manifest" href="/manifest.json" />
        <ScrollViewStyleReset />
        <style>{`
          html, body { background: #0f1419; }
          #root { display: flex; min-height: 100%; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}